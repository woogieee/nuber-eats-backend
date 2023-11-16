// PartialType은 type의 모든 property를 말하지만 옵션사항이다.

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

@InputType()
// Restaurant이 아니라 CreateRestaurantDto를 PartiaType으로 하는 이유는
// UpdateRestaurantDto에 ID가 꼭 필요하기 때문
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}

@InputType()
export class UpdateRestaurantDto {
  @Field(() => Number)
  id: number;

  @Field(() => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
