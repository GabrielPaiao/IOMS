// src/types/express.d.ts
import { User } from '@prisma/client';

declare module 'express' {
  interface Request {
    user?: Omit<User, 'password'> & { 
      id: string;
      companyId: string;
    };
  }
}