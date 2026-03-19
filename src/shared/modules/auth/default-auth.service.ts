import { inject, injectable } from 'inversify';
import { AuthService } from './auth.service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';
import { UserService } from '../user/user-service.interface.js';

@injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService
  ) {}

  public async authenticate(user: DocumentType<UserEntity>): Promise<string> {
    // В реальном приложении здесь будет генерация JWT токена
    // Для демонстрации возвращаем простую строку
    const token = `token_${user._id}_${Date.now()}`;

    this.logger.info(`User ${user.email} authenticated successfully`);
    return token;
  }

  public async verify(token: string): Promise<DocumentType<UserEntity> | null> {
    // В реальном приложении здесь будет проверка JWT токена
    // Для демонстрации просто ищем пользователя по email из токена
    const email = token.split('_')[1];
    const user = await this.userService.findByEmail(email);

    this.logger.info(`Token verification: ${user ? 'success' : 'failed'}`);
    return user;
  }

  public async login(email: string, _password: string): Promise<DocumentType<UserEntity> | null> {
    // В реальном приложении здесь будет проверка учетных данных
    // Для демонстрации просто ищем пользователя по email
    const user = await this.userService.findByEmail(email);

    this.logger.info(`User ${email} logged in successfully`);
    return user;
  }

  public async logout(token: string): Promise<void> {
    // В реальном приложении здесь может быть добавление токена в черный список
    this.logger.info(`User with token ${token} logged out`);
  }

  public async getCurrentUser(token: string): Promise<DocumentType<UserEntity> | null> {
    return this.verify(token);
  }
}
