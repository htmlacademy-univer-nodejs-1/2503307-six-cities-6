import { defaultClasses, getModelForClass, prop, modelOptions } from '@typegoose/typegoose';
import { User } from '../../types/index.js';
import { createSHA256 } from '../../helpers/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ unique: true, required: true, trim: true })
  public email: string;

  @prop({ required: false, default: 'https://api.dicebear.com/9.x/initials/svg?seed=Six%20Cities&backgroundColor=3b82f6' })
  public avatarPath: string;

  @prop({ required: true, minlength: 1, maxlength: 15 })
  public firstname: string;

  @prop({ required: true, minlength: 1, maxlength: 15 })
  public lastname: string;

  @prop({ required: true, minlength: 6, maxlength: 64, select: false })
  public password?: string;

  @prop({ required: true, enum: ['ordinary', 'pro'] })
  public userType!: 'ordinary' | 'pro';

  constructor(userData: User) {
    super();

    this.email = userData.email;
    this.avatarPath = userData.avatarPath;
    this.firstname = userData.firstname;
    this.lastname = userData.lastname;
    this.userType = userData.userType;
  }

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public getPassword() {
    return this.password;
  }

  public comparePassword(password: string, salt: string): boolean {
    return this.password === createSHA256(password, salt);
  }
}

export const UserModel = getModelForClass(UserEntity);
