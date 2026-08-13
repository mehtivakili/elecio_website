import { Model } from 'objection';
import { BaseModel } from './BaseModel';
import { Post } from './Post';

export class Category extends BaseModel {
  static tableName = 'categories';

  slug!: string;
  nameFa!: string;
  nameEn!: string;
  sortOrder!: number;

  static relationMappings = () => ({
    posts: {
      relation: Model.HasManyRelation,
      modelClass: Post,
      join: { from: 'categories.id', to: 'posts.category_id' },
    },
  });
}
