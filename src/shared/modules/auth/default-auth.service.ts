import { inject, injectable } from 'inversify';
import { AuthService } from './auth.service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';

@injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: any
  ) {}

  public async authenticate(user: DocumentType<UserEntity>): Promise<string> {
    // В реальном приложении здесь будет генерация JWT токена
    // Для демонстрации возвращаем простую строку
    const token = `token_${user._id}_${Date.now()}`;
    
    this.logger.info(`User ${user.email} authenticated successfully`);
    return token;
  }

  public async verify(token: string): Promise<DocumentType<UserEntity> | null> {
    try {
      // В реальном приложении здесь будет верификация JWT токена
      // Для демонстрации просто проверяем формат токена
      if (!token.startsWith('token_')) {
        return null;
      }
      
      const userId = token.split('_')[1];
      const user = await this.userService.findById(userId);
      return user;
    } catch (error) {
      this.logger.warn('Invalid token provided');
      return null;
    }
  }

  public async login(email: string): Promise<DocumentType<UserEntity> | null> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      this.logger.warn(`Login failed: user with email ${email} not found`);
      return null;
    }
    
    // В реальном приложении здесь должна быть проверка пароля
    // Например: if (!await bcrypt.compare(password, user.getPassword())) return null;
    
    this.logger.info(`User ${email} logged in successfully`);
    return user;
  }

  public async logout(): Promise<void> {
    // В реальном приложении здесь может быть добавление токена в черный список
    this.logger.info('User logged out');
  }

  public async getCurrentUser(token: string): Promise<DocumentType<UserEntity> | null> {
    return this.verify(token);
  }
}
