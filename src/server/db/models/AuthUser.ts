import { Model } from 'objection';
import { BaseModel } from './BaseModel';
import { UserProfile } from './UserProfile';

export class AuthUser extends BaseModel {
  static tableName = 'auth_users';

  id!: string;
  name!: string;
  email!: string;
  emailVerified!: boolean;
  image?: string | null;
  phoneNumber?: string | null;
  phoneNumberVerified!: boolean;
  twoFactorEnabled!: boolean;

  static relationMappings = () => ({
    profile: {
      relation: Model.HasOneRelation,
      modelClass: UserProfile,
      join: { from: 'auth_users.id', to: 'user_profiles.user_id' },
    },
  });
}
