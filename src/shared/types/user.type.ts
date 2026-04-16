export type User = {
  email: string;
  avatarPath: string;
  firstname: string;
  lastname: string;
  password?: string;
  userType: 'ordinary' | 'pro';
}
