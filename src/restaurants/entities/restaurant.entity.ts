import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

// InputType으로 지정하지만 스키마가 유일한 type을 가져야하기 때문에 스키마에 포함되지 않게 함
// isAbstract를 쓰면 이걸 어디선가 복사해서 쓴다는 얘기
// create-restaurant.dto에 OmitType에 두번째 argument로 InputType을 추가해서 사용할지.
// entity에 InputType을 추가해서 사용할지 본인선택
@InputType('RestaurantInputType', { isAbstract: true })
// graphql 사용을 위한 ObjectType 선언
@ObjectType()
// TypeORM 사용을 위한 Entity
@Entity()
// 클래스 하나로 graphQL 스키마와 DB에 model을 만듬
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  // 오더
  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  // nullable: 카테고리를 지울때 레스토랑을 지우면 안돼서 추가
  @Field(() => Category, { nullable: true })
  // restaurant는 category를 가질 수 있고 만약 category가 지워지면 restaurant는 category를 가지지 않게 됨
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  // OneToMany의 type이 Dish, function(Dish의 restaurant을 dish.restaurant에서 찾음)
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[];
}
