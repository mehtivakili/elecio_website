import { Model } from 'objection';
import { BaseModel } from './BaseModel';
import { Category } from './Category';
import { Tag } from './Tag';
import { AuthUser } from './AuthUser';

export type PostStatus = 'draft' | 'published';

export class Post extends BaseModel {
  static tableName = 'posts';

  slug!: string;
  categoryId?: number | null;
  authorUserId?: string | null;

  titleFa!: string;
  titleEn!: string;
  excerptFa?: string;
  excerptEn?: string;
  bodyFa!: string;
  bodyEn!: string;
  coverImagePath?: string;

  seoTitleFa?: string;
  seoTitleEn?: string;
  seoDescriptionFa?: string;
  seoDescriptionEn?: string;

  status!: PostStatus;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  translationStatus!: 'fa_only' | 'en_only' | 'complete';
  currentRevisionNumber!: number;
  updatedBy?: string | null;
  coverAltFa?: string | null;
  coverAltEn?: string | null;

  static jsonSchema = {
    type: 'object',
    required: ['slug', 'titleFa', 'titleEn', 'bodyFa', 'bodyEn'],
    properties: {
      id: { type: 'integer' },
      slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
      titleFa: { type: 'string', minLength: 1 },
      titleEn: { type: 'string', minLength: 1 },
      status: { type: 'string', enum: ['draft', 'published'] },
    },
  };

  static relationMappings = () => ({
    category: {
      relation: Model.BelongsToOneRelation,
      modelClass: Category,
      join: { from: 'posts.category_id', to: 'categories.id' },
    },
    author: {
      relation: Model.BelongsToOneRelation,
      modelClass: AuthUser,
      join: { from: 'posts.author_user_id', to: 'auth_users.id' },
    },
    tags: {
      relation: Model.ManyToManyRelation,
      modelClass: Tag,
      join: {
        from: 'posts.id',
        through: { from: 'post_tags.post_id', to: 'post_tags.tag_id' },
        to: 'tags.id',
      },
    },
  });
}
