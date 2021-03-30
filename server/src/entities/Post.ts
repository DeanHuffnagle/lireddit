//_______________________________________________________________
//                         IMPORTS
//_______________________________________________________________
import { Field, ObjectType } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

//_______________________________________________________________
//                         POST ENTITY
//_______________________________________________________________
@ObjectType()
@Entity()
export class Post extends BaseEntity {
	//_______________________________________________________________
	//                         ID COLUMN
	//_______________________________________________________________

	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	//_______________________________________________________________
	//                       TITLE
	//_______________________________________________________________

	@Field()
	@Column()
	title!: string;

	//_______________________________________________________________
	//                       TEXT
	//_______________________________________________________________

	@Field()
	@Column()
	text!: string;

	//_______________________________________________________________
	//                       POINTS
	//_______________________________________________________________

	@Field()
	@Column({ type: 'int', default: 0 })
	points!: number;

	//_______________________________________________________________
	//                     CREATOR ID
	//_______________________________________________________________

	@Field()
	@Column()
	creatorId: number;

	//_______________________________________________________________
	//              MANY TO ONE RELATIONSHIP WITH USER
	//_______________________________________________________________

	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	//_______________________________________________________________
	//                    CREATED AT
	//_______________________________________________________________

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	//_______________________________________________________________
	//                    UPDATED AT
	//_______________________________________________________________

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
