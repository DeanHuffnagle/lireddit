//_______________________________________________________________
//                           IMPORTS                           
//_______________________________________________________________

import { User } from '../entities/User';
import {
	Resolver,
	Arg,
	Field,
	Ctx,
	Mutation,
	ObjectType,
	Query,
} from 'type-graphql';
import argon2 from 'argon2';
import { MyContext } from 'src/types';
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { usernamePasswordInput } from '../utils/usernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';

//_______________________________________________________________
//                       OBJECT TYPES                                    
//_______________________________________________________________

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

//_______________________________________________________________
//                        RESOLVERS                                    
//_______________________________________________________________

@Resolver()
export class UserResolver {
// _____________________________________________________________
//                 CHANGE PASSWORD MUTATION
// _____________________________________________________________

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string
    @Arg("newPassword") newPassword: string
    @Ctx() {redis, em, req}: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return { errors: [
        {
          field: 'newPassword',
          message: 'Length must be greater than 3.',
        },
      ]};
    }
    const key = FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get( key );
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired.",
          }
        ]
      }
    }

    const user = await em.findOne(User, {id: parseInt(userId)})

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists.",
          }
        ]
      }
    }
    user.password = await argon2.hash(newPassword)
    await em.persistAndFlush(user)
    
    await redis.del(key)

    req.session.userId = user.id

    return {user}

  }
// _____________________________________________________________
//                   FORGOT PASSWORD MUTATION
// _____________________________________________________________
	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg('email') email: string,
		@Ctx() { em, redis }: MyContext
	) {
		const user = await em.findOne(User, { email });
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
      return true
		);
	}
// _____________________________________________________________
//                         ME QUERY
// _____________________________________________________________
	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		// you are not logged in
		if (!req.session.userID) {
			return null;
		}

		const user = await em.findOne(User, { id: req.session.userID });
		return user;
	}
 
// _____________________________________________________________
//                    REGISTER MUTATION 
// _____________________________________________________________
  @Mutation(() => UserResponse)
	async register(
		@Arg('options') options: usernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}
		const hashedPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username: options.username,
					email: options.email,
					password: hashedPassword,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning('*');
			user = result[0];
		} catch (err) {
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
// _____________________________________________________________
//                     LOGIN MUTATION
// _____________________________________________________________

  @Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(
			User,
			usernameOrEmail.includes('@')
				? { email: usernameOrEmail }
				: { username: usernameOrEmail }
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

		req.session.userID = user.id;

		return {
			user,
		};
  }
	
// _____________________________________________________________
//                     LOGOUT MUTATION
// _____________________________________________________________
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
