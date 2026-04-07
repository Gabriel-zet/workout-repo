export type CreateUserRepoInput = {
  email: string;
  name?: string;
  passwordHash: string;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: Date | null;
};