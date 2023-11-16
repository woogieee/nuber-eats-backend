import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// InputType으로 지정하지만 스키마가 유일한 type을 가져야하기 때문에 스키마에 포함되지 않게 함
// isAbstract를 쓰면 이걸 어디선가 복사해서 쓴다는 얘기
// create-restaurant.dto에 OmitType에 두번째 argument로 InputType을 추가해서 사용할지.
// entity에 InputType을 추가해서 사용할지 본인선택
@InputType({ isAbstract: true })
// graphql 사용을 위한 ObjectType 선언
@ObjectType()
// TypeORM 사용을 위한 Entity
@Entity()
// 클래스 하나로 graphQL 스키마와 DB에 model을 만듬
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  // graphql 스키마에서 이 필드의 defaultValue가 true
  @Field(() => Boolean, { nullable: true })
  // DB에서 이 필드의 defaultValue가 true
  @Column({ default: true })
  @IsBoolean()
  @IsOptional()
  // IsOptional()은 이 필드가 없다면 무시하고 진행
  isVegan: boolean;

  @Field(() => String, { defaultValue: '강남' })
  @Column()
  @IsString()
  address: string;

  // @Field(() => String)
  // @Column()
  // ownersName: string;

  // @Field(() => String)
  // @Column()
  // categoryName: string;
}
