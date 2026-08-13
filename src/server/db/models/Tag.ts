import { Model } from 'objection';
import { BaseModel } from './BaseModel';
import { Post } from './Post';

export class Tag extends BaseModel {
  static tableName = 'tags';

  slug!: string;
  nameFa!: string;
  nameEn!: string;

  static relationMappings = () => ({
    posts: {
      relation: Model.ManyToManyRelation,
      modelClass: Post,
      join: {
        from: 'tags.id',
        through: { from: 'post_tags.tag_id', to: 'post_tags.post_id' },
        to: 'posts.id',
      },
    },
  });
}
