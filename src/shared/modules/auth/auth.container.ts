import { Container } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { AuthService } from './auth.service.interface.js';
import { DefaultAuthService } from './default-auth.service.js';

const authContainer = new Container();

authContainer.bind<AuthService>(Component.AuthService).to(DefaultAuthService).inSingletonScope();

export default authContainer;
