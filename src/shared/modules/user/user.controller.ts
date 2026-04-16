import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { UserService } from './user-service.interface.js';
import { AuthService } from '../auth/auth.service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginDto } from '../auth/dto/login.dto.js';
import asyncHandler from 'express-async-handler';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.AuthService) private readonly authService: AuthService,
  ) {
    super(logger);
  }

  public getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await this.userService.findByEmail(email as string);

    if (!user) {
      this.notFound(res, `User with email ${email} not found`);
      return;
    }

    this.ok(res, user);
  });

  public createUser = asyncHandler(async (req: Request, res: Response) => {
    // Only anonymous users can create new accounts (5.8.3)
    if (res.locals.user) {
      this.forbidden(res, 'Only anonymous users can create new accounts');
      return;
    }

    const { email, password, firstname, lastname, avatarPath } = req.body;

    // Check if email already exists (5.8.4)
    const existingUser = await this.userService.findByEmail(email as string);
    if (existingUser) {
      this.conflict(res, `User with email ${email} already exists`);
      return;
    }

    const salt = 'test-salt-value'; // In real app, get from config

    const createUserDto: CreateUserDto = {
      email: email as string,
      password: password as string,
      firstname: firstname as string,
      lastname: lastname as string,
      avatarPath: avatarPath as string,
    };

    const newUser = await this.userService.create(createUserDto, salt);

    // Return user without password (5.8.6)
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      avatarPath: newUser.avatarPath,
    };

    this.created(res, userResponse);
  });

  public uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const avatarPath = req.file?.path;

    if (!avatarPath) {
      this.badRequest(res, 'Avatar file is required');
      return;
    }

    const user = res.locals.user;
    const updatedUser = await this.userService.updateById(user.id, { avatarPath });
    this.ok(res, { ...updatedUser!.toObject(), avatarPath });
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const loginDto: LoginDto = req.body;
    const user = await this.authService.login(loginDto.email, loginDto.password);

    if (!user) {
      this.unauthorized(res, 'Invalid email or password');
      return;
    }

    const token = await this.authService.authenticate(user);
    this.ok(res, { token, user });
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      await this.authService.logout(token);
    }

    this.noContent(res);
  });

  public getCurrentUser = asyncHandler(async (_req: Request, res: Response) => {
    const user = res.locals.user;
    this.ok(res, user);
  });
}
