import { DataSource, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private readonly dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name
      // 앞뒤 빈칸을 지워줌
      .trim()
      // 다 소문자로 변경
      .toLowerCase();
    // 빈칸을 다 지우고 '-'으로 바꿈
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
