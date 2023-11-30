import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

// InputType으로 지정하지만 스키마가 유일한 type을 가져야하기 때문에 스키마에 포함되지 않게 함
// isAbstract를 쓰면 이걸 어디선가 복사해서 쓴다는 얘기
// create-restaurant.dto에 OmitType에 두번째 argument로 InputType을 추가해서 사용할지.
// entity에 InputType을 추가해서 사용할지 본인선택
@InputType('CategoryInputType', { isAbstract: true })
// graphql 사용을 위한 ObjectType 선언
@ObjectType()
// TypeORM 사용을 위한 Entity
@Entity()
// 클래스 하나로 graphQL 스키마와 DB에 model을 만듬
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
