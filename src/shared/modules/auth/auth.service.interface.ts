import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';

export interface AuthService {
  authenticate(user: DocumentType<UserEntity>): Promise<string>;
  verify(token: string): Promise<DocumentType<UserEntity> | null>;
  login(email: string): Promise<DocumentType<UserEntity> | null>;
  logout(): Promise<void>;
  getCurrentUser(token: string): Promise<DocumentType<UserEntity> | null>;
}
