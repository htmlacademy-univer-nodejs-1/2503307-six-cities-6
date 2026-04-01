import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/rest/controller/base.controller.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { UserService } from './user-service.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import asyncHandler from 'express-async-handler';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
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
    const { email, password, firstname, lastname, avatarPath } = req.body;
    const salt = 'test-salt-value'; // In real app, get from config

    const createUserDto: CreateUserDto = {
      email: email as string,
      password: password as string,
      firstname: firstname as string,
      lastname: lastname as string,
      avatarPath: avatarPath as string,
    };

    const newUser = await this.userService.create(createUserDto, salt);
    this.created(res, newUser);
  });

  public uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const avatarPath = req.file?.path;

    if (!avatarPath) {
      this.badRequest(res, 'Avatar file is required');
      return;
    }

    const updatedUser = await this.userService.updateById(userId as string, { avatarPath });

    if (!updatedUser) {
      this.notFound(res, `User with id ${userId} not found`);
      return;
    }

    this.ok(res, { ...updatedUser.toObject(), avatarPath });
  });
}
