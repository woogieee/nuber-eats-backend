import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateCategoryInput extends PickType(Category, [
  'name',
  'slug',
  'coverImg',
]) {}

@ObjectType()
export class CreateCategoryOutput extends CoreOutput {}
