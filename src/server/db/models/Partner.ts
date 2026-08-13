import { BaseModel } from './BaseModel';

export class Partner extends BaseModel {
  static tableName = 'partners';

  name!: string;
  logoPath!: string;
  websiteUrl?: string;
  sortOrder!: number;
  isActive!: boolean;
}
