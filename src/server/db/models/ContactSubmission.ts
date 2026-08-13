import { BaseModel } from './BaseModel';

export type Persona = 'business_owner' | 'programmer' | 'operator' | 'unknown';
export type ContactStatus = 'new' | 'contacted' | 'closed';

export class ContactSubmission extends BaseModel {
  static tableName = 'contact_submissions';

  name!: string;
  phone!: string;
  email?: string;
  company?: string;
  message?: string;
  locale!: string;
  sourcePage?: string;
  persona!: Persona;
  status!: ContactStatus;
  ipHash?: string;
  userId?: string | null;

  static jsonSchema = {
    type: 'object',
    required: ['name', 'phone'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 200 },
      phone: { type: 'string', minLength: 5, maxLength: 20 },
      email: { type: 'string', format: 'email' },
      company: { type: 'string', maxLength: 200 },
      message: { type: 'string', maxLength: 5000 },
      locale: { type: 'string', maxLength: 5 },
      sourcePage: { type: 'string', maxLength: 200 },
      persona: {
        type: 'string',
        enum: ['business_owner', 'programmer', 'operator', 'unknown'],
      },
      status: { type: 'string', enum: ['new', 'contacted', 'closed'] },
    },
  };
}
