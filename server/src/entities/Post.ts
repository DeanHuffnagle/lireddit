//// Imports ////
import { Field, ObjectType } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Updoot } from './Updoot';
import { User } from './User';

//// Post Entity ////
@ObjectType()
@Entity()
export class Post extends BaseEntity {
	//// Post Id ////
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	//// Title ////
	@Field()
	@Column()
	title!: string;

	//// Text ////
	@Field()
	@Column()
	text!: string;

	//// Points ////
	@Field()
	@Column({ type: 'int', default: 0 })
	points!: number;

	//// Creator Id ////
	@Field()
	@Column()
	creatorId: number;

	//// Many To One Relationship With User ////
	@Field()
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	//// One To Many Relationship With Updoots ////
	@OneToMany(() => Updoot, (updoot) => updoot.post)
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
