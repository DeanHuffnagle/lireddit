//// Imports ////
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

//// Updoot Entity ////
@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	//// Value ////
	@Field()
	@Column({ type: 'int' })
	value: number;

	//// User Id ////
	@Field()
	@PrimaryColumn()
	userId: number;

	//// Many To One Relationship With User ////
	@Field(() => User)
	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	//// Post Id ////
	@Field()
	@PrimaryColumn()
	postId: number;

	//// Many To One Relationship With Post ////
	@Field(() => Post)
	@ManyToOne(() => Post, (post) => post.updoots)
	post: Post;
}
