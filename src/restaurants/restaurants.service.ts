import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
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
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/create-category.dto';
import {
  DeleteCategoryInput,
  DeleteCategoryOutput,
} from './dtos/delete-category.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  private readonly setPage: number = 6;

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
        // 레스토랑 id만 받아서 프론트에서 보여주기 때문에 프로그램이 가벼워짐
        restaurantId: newRestaurant.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  // 오너 레스토랑 조회
  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({
        where: { owner: { id: owner.id } },
        // 위의 코드에서 owner.id로 변경하여 owner의 ID에 해당하는 레스토랑을 찾음
      });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  // 본인 특정 레스토랑 정보 조회
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { owner: { id: owner.id }, id },
        relations: ['menu', 'orders'],
      });
      console.log(restaurant);
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  // 레스토랑 수정
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

  // 레스토랑 삭제
  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
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
          error: `You can't delete a restaurant that you don't own`,
        };
      }
      console.log('레스토랑 삭제', restaurant);
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete restaurant.',
      };
    }
  }

  // 카테고리 생성
  async createCategory(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    try {
      const newCategory = this.categories.create(createCategoryInput);
      await this.categories.save(newCategory);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create category',
      };
    }
  }

  // 카테고리 삭제
  async deleteCategory({
    categoryId,
  }: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      await this.categories.delete(categoryId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete category.',
      };
    }
  }

  // 모든 카테고리 조회
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      // 모든 카테고리 찾기
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load cateogries',
      };
    }
  }

  // 카테고리에 해당하는 레스토랑 개수 조회
  countRestaurants(category: Category) {
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  // 카테고리에 해당하는 레스토랑만 보기
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ where: { slug } });
      // relations: ['restaurants'], 으로 할 경우 모든 갯수의 레스토랑을 load하기 때문에 DB가 저세상 갈수도 있음
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      // 카테고리에 해당하는 레스토랑 찾기
      const restaurants = await this.restaurants.find({
        where: { category: { id: category.id } },
        order: {
          // 내림차순 정렬로 상단노출
          isPromoted: 'DESC',
        },
        take: this.setPage, // 한 페이지에 6개 레스토랑 찾기
        skip: (page - 1) * this.setPage, // 두번째 이후 페이지
      });
      // 페이지 삽입
      category.restaurants = restaurants;
      // 토탈 페이지
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / this.setPage),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  // 모든 레스토랑 조회
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * this.setPage,
        take: this.setPage,
        order: {
          // 내림차순 정렬로 상단노출
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / this.setPage),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  // 레스토랑 ID로 단건 조회
  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  // 레스토랑 이름으로 조회
  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        // 대소문자 상관없이 검색-ILIKE, DB에 직접 접근
        where: { name: Raw((name) => `${name} ILIKE '%${query}%'`) },
        skip: (page - 1) * this.setPage,
        take: this.setPage,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / this.setPage),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurants',
      };
    }
  }

  // 메뉴생성
  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      // 레스토랑 찾기
      const restaurant = await this.restaurants.findOne({
        where: { id: createDishInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // owner와 레스토랑의 owner이 같은지 확인
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: `You can't do that.`,
        };
      }
      // dish를 생성하고 레스토랑에 dish 추가
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }
  // async checkDishOwner(ownerId: number, dishId: number) {}

  // 메뉴 수정
  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        // restaurant.ownerId를 가져와야 하기 때문에 relations 필요
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: `You can't do that.`,
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  // 메뉴 삭제
  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: dishId },
        // restaurant.ownerId를 가져와야 하기 때문에 relations 필요
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: `You can't do that.`,
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }
}
