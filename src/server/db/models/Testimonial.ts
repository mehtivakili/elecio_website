import { BaseModel } from './BaseModel';

export class Testimonial extends BaseModel {
  static tableName = 'testimonials';

  customerName!: string;
  companyName?: string;
  quoteFa?: string;
  quoteEn?: string;
  videoUrl?: string;
  avatarPath?: string;
  sortOrder!: number;
  isActive!: boolean;
}
