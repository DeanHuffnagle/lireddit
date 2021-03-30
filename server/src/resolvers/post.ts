//// Imports ////
import { Arg, InputType, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';

@InputType
//// Resolver ////
@Resolver()
export class PostResolver {
	//// Find Posts ////
	@Query(() => [Post])
	async posts(): Promise<Post[]> {
		return Post.find();
	}

	//// Find Posts ////
	@Query(() => Post, { nullable: true })
	post(@Arg('id') id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	//// Create Post ////
	@Mutation(() => Post)
	async createPost(@Arg('title') title: string): Promise<Post> {
		return Post.create({ title }).save();
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
