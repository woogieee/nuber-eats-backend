import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  // 레스토랑 생성
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      // .create을 부르면 restaurant의 instance를 생성하지만 DB에는 저장하지 않음
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      // 레스토랑을 찾고 에러가 있으면 exception을 throw
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
        // Id만 가져오고 object를 가져오지 않음
        // loadRelationIds: true,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // owner 확인 = user와 일치한지
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: `You can't edit a restaurant that you don't own`,
        };
      }
      let category: Category = null;
      // edit restaurant input에 category가 있을 경우에만
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      // object(entity)를 만들고
      await this.restaurants.save([
        {
          // save에서 id를 보내지 않을경우 새로운 entity를 생성한다.
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          // category가 존재하면 category가 category인 object를 리턴
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }
}
