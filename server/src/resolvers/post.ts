//// Imports ////

import { MyContext } from '../types';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';

//// Input Type ////
@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

//// Object Type ////
@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

//// Resolver ////
@Resolver(Post)
export class PostResolver {
	//// Field Resolvers ////

	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	//// Vote ////
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int) postId: number,
		@Arg('value', () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const userId = req.session.UserID;
		await Updoot.insert({
			userId,
			postId,
			value: realValue,
		});
		await getConnection().query(
			`
      UPDATE post 
      SET points = points + $1
      WHERE id = $2
    `,
			[realValue, postId]
		);
		return true;
	}

	//// Find Posts ////
	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await getConnection().query(
			`
		SELECT p.*, 
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator
    FROM post p
    INNER JOIN public.user u ON u.id = p."creatorId"
		${cursor ? `WHERE p."createdAt" < $2` : ''}
		ORDER BY p."createdAt" DESC
    LIMIT $1
		`,
			replacements
		);

		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder('p')
			.innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
			.orderBy('p."createdAt"', 'DESC')
			.take(realLimitPlusOne);

		// if (cursor) {
		// 	qb.where('p."createdAt" < :cursor', {
		// 		cursor: new Date(parseInt(cursor)),
		// 	});
		// }

		// const posts = await qb.getMany();
		console.log('posts: ', posts);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	//// Find Posts ////
	@Query(() => Post, { nullable: true })
	post(@Arg('id') id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	//// Create Post ////
	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('input') input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session.UserID,
		}).save();
	}

	//// Update Post ////
	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id') id: number,
		@Arg('title', () => String, { nullable: true }) title: string
	): Promise<Post | null> {
		const post = await Post.findOne(id);
		if (!post) {
			return null;
		}
		if (typeof title !== 'undefined') {
			post.title = title;
			Post.update({ id }, { title });
		}
		return post;
	}

	//// Delete Post ////
	@Mutation(() => Boolean)
	async deletePost(@Arg('id') id: number): Promise<boolean> {
		await Post.delete(id);
		return true;
	}
}
