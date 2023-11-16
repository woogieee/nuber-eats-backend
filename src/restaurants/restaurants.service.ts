import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  // 모든 restaurant을 가져옴
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  // 레스토랑 생성
  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(createRestaurantDto);
    return this.restaurants.save(newRestaurant);
  }

  // 레스토랑 업데이트
  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    return this.restaurants.update(id, { ...data });
    // update는 Promise를 반환함.
    // db에 entity가 있는지 확인하지 않고 update query를 실행함
  }
}
