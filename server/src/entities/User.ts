//// Imports ////
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { Updoot } from './Updoot';

//// User Entity ////
@ObjectType()
@Entity()
export class User extends BaseEntity {
	//// User ID ////
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	//// Username ////
	@Field()
	@Column({ unique: true })
	username!: string;

	//// Email ////
	@Field()
	@Column({ unique: true })
	email!: string;

	//// Password ////
	@Column()
	password!: string;

	//// One To Many Relationship With Posts ////
	@OneToMany(() => Post, (post) => post.creator)
	posts: Post[];

	//// One To Many Relationship With Updoots ////
	@OneToMany(() => Updoot, (updoot) => updoot.user)
	updoots: Updoot[];

	//// Created At ////
	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	//// Updated At ////
	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
