import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';

export interface AuthService {
  authenticate(user: DocumentType<UserEntity>): Promise<string>;
  verify(token: string): Promise<DocumentType<UserEntity> | null>;
  login(email: string, password: string): Promise<DocumentType<UserEntity> | null>;
  logout(token: string): Promise<void>;
  getCurrentUser(token: string): Promise<DocumentType<UserEntity> | null>;
}
