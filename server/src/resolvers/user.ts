//// Imports ////
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { sendEmail } from '../utils/sendEmail';
import { usernamePasswordInput } from '../utils/usernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';

//// Object Types ////
@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

//// Resolver ////
@Resolver(User)
export class UserResolver {
	//// Field Resolvers ////
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() { req }: MyContext) {
		// this is the current user
		if (req.session.UserID === user.id) {
			return user.email;
		}
		// not the current user
		return '';
	}

	//// Change Password Mutation ////
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 3) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'Length must be greater than 3.',
					},
				],
			};
		}
		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);
		if (!userId) {
			return {
				errors: [
					{
						field: 'token',
						message: 'Token expired.',
					},
				],
			};
		}
		const userIdNum = parseInt(userId);
		const user = await User.findOne(userIdNum);

		if (!user) {
			return {
				errors: [
					{
						field: 'token',
						message: 'User no longer exists.',
					},
				],
			};
		}

		await User.update(
			{ id: userIdNum },
			{
				password: await argon2.hash(newPassword),
			}
		);

		await redis.del(key);

		req.session.UserID = user.id;

		return { user };
	}
	//// Forgot Password Mutation ////
	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg('email') email: string,
		@Ctx() { redis }: MyContext
	) {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			// the email is not in the database.
			return true;
		}

		const token = v4();

		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			'ex',
			1000 * 60 * 60 * 24 * 3
		); // 3 days

		await sendEmail(
			email,
			`<a href="http://localhost:3000/change-password/${token}">reset password</a>`
		);
		return true;
	}

	//// Me Query ////
	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		// you are not logged in
		if (!req.session.UserID) {
			return null;
		}

		return User.findOne(req.session.UserID);
	}

	//// Register Mutation ////
	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: usernamePasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}
		const hashedPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					username: options.username,
					email: options.email,
					password: hashedPassword,
				})
				.returning('*')
				.execute();
			user = result.raw[0];
		} catch (err) {
			console.log('err: ', err);
			// duplicate username error
			if (err.code === '23505') {
				return {
					errors: [
						{
							field: 'username',
							message: 'Username already exists.',
						},
					],
				};
			}
			console.log('message: ', err.message);
		}

		// store user id session
		// this will set a cookie
		// keeps them logged in
		req.session.UserID = user.id;

		return { user };
	}

	//// Login Mutation ////
	@Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			usernameOrEmail.includes('@')
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);
		if (!user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: "User doesn't exist.",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'Incorrect password.',
					},
				],
			};
		}

		req.session.UserID = user.id;

		return {
			user,
		};
	}

	//// Logout Mutation ////
	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);
				if (err) {
					console.log(err);
					resolve(false);
					return;
				}

				resolve(true);
			})
		);
	}
}
