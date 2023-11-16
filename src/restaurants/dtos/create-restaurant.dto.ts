import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

// InputType = 하나의 object로 보면 됨 object를 전달
// ArgsType = 분리된 값들을 GraphQL argument로 전달.
@InputType()
export class CreateRestaurantDto extends OmitType(
  // OmitType은 InputType에만 작동
  Restaurant,
  ['id'],
  // InputType,
) {}
