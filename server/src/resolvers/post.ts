//_______________________________________________________________
//                         IMPORTS
//_______________________________________________________________
import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post';
//_______________________________________________________________
//                         RESOLVERS
//_______________________________________________________________
@Resolver()
export class PostResolver {
	//_______________________________________________________________
	//                       FIND POSTS
	//_______________________________________________________________

	@Query(() => [Post])
	async posts(): Promise<Post[]> {
		return Post.find();
	}

	//_______________________________________________________________
	//                         FIND POST
	//_______________________________________________________________

	@Query(() => Post, { nullable: true })
	post(@Arg('id') id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	//_______________________________________________________________
	//                         CREATE POST
	//_______________________________________________________________

	@Mutation(() => Post)
	async createPost(@Arg('title') title: string): Promise<Post> {
		return Post.create({ title }).save();
	}

	//_______________________________________________________________
	//                        UPDATE POST
	//_______________________________________________________________

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

	//_______________________________________________________________
	//                        DELETE POST
	//_______________________________________________________________

	@Mutation(() => Boolean)
	async deletePost(@Arg('id') id: number): Promise<boolean> {
		await Post.delete(id);
		return true;
	}
}
