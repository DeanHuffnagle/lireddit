import { User } from '../entities/User';
import {
	Resolver,
	Arg,
	InputType,
	Field,
	Ctx,
	Mutation,
	ObjectType,
	Query,
} from 'type-graphql';
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import { EntityManager } from '@mikro-orm/postgresql';

@InputType()
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

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

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		// you are not logged in
		if (!req.session.userID) {
			return null;
		}

		const user = await em.findOne(User, { id: req.session.userID });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		if (options.username.length <= 2) {
			return {
				errors: [
					{
						field: 'username',
						message: 'Length must be greater than 2.',
					},
				],
			};
		}

		if (options.password.length <= 3) {
			return {
				errors: [
					{
						field: 'password',
						message: 'Length must be greater than 3.',
					},
				],
			};
		}

		const hashedPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
					password: hashedPassword,
					created_At: new Date(),
					updated_At: new Date(),
				})
				.returning('*');
			user = result[0];
			console.log('result: ', result);
		} catch (err) {
			console.log(err);
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
		req.session.userID = user.id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username });
		if (!user) {
			return {
				errors: [
					{
						field: 'username',
						message: "Username doesn't exist.",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, options.password);
		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'incorrect password',
					},
				],
			};
		}

		req.session.userID = user.id;

		return {
			user,
		};
	}
}
