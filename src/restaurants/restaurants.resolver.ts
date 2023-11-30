import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { RestaurantService } from './restaurants.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  // owner인 user만 접근가능
  // @SetMetadata('role', UserRole.Owner)
  @Role(['Owner'])
  async createRestaurant(
    // restaurant의 owner는 로그인한 유저가 됨
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
    // async function을 쓸 때 Promise와 Value를 써야 됨.
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      // owner는 authorization 모듈에서 가져옴
      authUser,
      createRestaurantInput,
    );
  }
}
