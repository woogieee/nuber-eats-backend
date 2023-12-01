import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';

@Module({
  // forFeature는 TypeOrmModule이 특정 feature를 import 할수있게 해줌
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  // 클래스에 inject 할 수 있게 providers에 기입
  providers: [RestaurantResolver, RestaurantService, CategoryRepository],
})
export class RestaurantsModule {}
