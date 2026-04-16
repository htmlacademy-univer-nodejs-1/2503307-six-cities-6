import { inject, injectable } from 'inversify';
import * as jose from 'jose';
import { AuthService } from './auth.service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { DocumentType } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';
import { UserService } from '../user/user-service.interface.js';

@injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>
  ) {}

  public async authenticate(user: DocumentType<UserEntity>): Promise<string> {
    const secret = new TextEncoder().encode(this.config.get('JWT_SECRET'));
    const token = await new jose.SignJWT({
      email: user.email,
      id: user.id
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    this.logger.info(`User ${user.email} authenticated with JWT token`);
    return token;
  }

  public async verify(token: string): Promise<DocumentType<UserEntity> | null> {
    try {
      const secret = new TextEncoder().encode(this.config.get('JWT_SECRET'));
      const { payload } = await jose.jwtVerify(token, secret);
      const user = await this.userService.findByEmail(payload.email as string);
      return user;
    } catch {
      return null;
    }
  }

  public async login(email: string, password: string): Promise<DocumentType<UserEntity> | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(password, this.config.get('SALT'));
    if (!isPasswordValid) {
      return null;
    }

    this.logger.info(`User ${email} logged in successfully`);
    return user;
  }

  public async logout(_token: string): Promise<void> {
    this.logger.info('User logged out');
  }

  public async getCurrentUser(token: string): Promise<DocumentType<UserEntity> | null> {
    return this.verify(token);
  }
}
