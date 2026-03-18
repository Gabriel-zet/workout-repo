import { userRepo } from "../repositories/users.repo";
import type { CreateUserInput } from "../repositories/CreateUserInput";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1d";

if (!JWT_SECRET_ENV) {
  throw new Error("Missing JWT_SECRET env var");
}

const JWT_SECRET: Secret = JWT_SECRET_ENV;

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

    console.log("jwt typeof:", typeof jwt);
    console.log("jwt keys:", Object.keys(jwt));
    console.log("jwt.sign typeof:", typeof (jwt as any).sign);
    console.log("jwt.default typeof:", typeof (jwt as any).default);
    console.log("jwt.default?.sign typeof:", typeof (jwt as any).default?.sign);

    const user = await userRepo.findByEmail(input.email);
    if (!user) return null;

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return null;

    const signOptions: SignOptions = {
      subject: String(user.id),
      expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    const token = (jwt as any).default.sign({}, JWT_SECRET, signOptions);
    return token;
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
};