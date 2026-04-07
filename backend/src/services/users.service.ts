import { userRepo } from "../repositories/users.repo";
import type { CreateUserInput } from "../repositories/CreateUserInput";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h"; // Access token curto
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"; // Refresh token longo

if (!JWT_SECRET_ENV) {
  throw new Error("Missing JWT_SECRET env var");
}

const JWT_SECRET: Secret = JWT_SECRET_ENV;

// ✅ Gerar Access Token (curta duração)
function generateAccessToken(userId: number): string {
  const signOptions: SignOptions = {
    subject: String(userId),
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return (jwt as any).default.sign({}, JWT_SECRET, signOptions);
}

// ✅ Gerar Refresh Token (longa duração)
function generateRefreshToken(userId: number): string {
  const signOptions: SignOptions = {
    subject: String(userId),
    expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return (jwt as any).default.sign({}, JWT_SECRET, signOptions);
}


export const usersService = {
  async create(input: CreateUserInput) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    return userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });
  },

  async authenticate(input: { email: string; password: string }) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) return null;

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return null;

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Calcula data de expiração (7 dias)
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    // Salva no db para validação futura
    await userRepo.updateRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);

    return {
      accessToken,
      refreshToken,
    };
  },

  
  // Renova access token usando refresh token 
  async refreshAccessToken(refreshToken: string) {
    try {
      // Validar refresh token
      const payload = (jwt as any).default.verify(refreshToken, JWT_SECRET) as any;
      const userId = Number(payload.sub);

      if (!userId || !Number.isInteger(userId)) {
        return null;
      }

      const userFromDb = await userRepo.findById(userId);
      if (!userFromDb || userFromDb.refreshToken !== refreshToken) {
        return null;
      }

      if (userFromDb.refreshTokenExpiresAt && userFromDb.refreshTokenExpiresAt < new Date()) {
        return null; // Expirado
      }

      // Gera novo access token
      const newAccessToken = generateAccessToken(userId);

      return {
        accessToken: newAccessToken,
        refreshToken, // Pode reutilizar ou gerar novo
      };
    } catch {
      return null;
    }
  },



  async list() {
    return userRepo.findMany();
  },

  async getById(id: number) {
    return userRepo.findById(id);
  },

  async remove(id: number) {
    return userRepo.deleteById(id);
  },
  
  async logout(userId: number) {
    await userRepo.invalidateRefreshToken(userId);
  },
};