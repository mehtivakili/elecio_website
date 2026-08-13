import { Model } from 'objection';
import { BaseModel } from './BaseModel';
import type { AppRole } from '@/server/auth/rbac';
import { AuthUser } from './AuthUser';

export class UserProfile extends BaseModel {
  static tableName = 'user_profiles';
  static idColumn = 'user_id';

  userId!: string;
  role!: AppRole;
  companyName?: string | null;
  locale!: 'fa' | 'en';
  isActive!: boolean;
  lastLoginAt?: string | null;

  static relationMappings = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: AuthUser,
      join: { from: 'user_profiles.user_id', to: 'auth_users.id' },
    },
  });
}
