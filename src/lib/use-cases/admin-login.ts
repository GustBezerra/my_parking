import { compare } from "bcryptjs";
import type { AdminUser, AdminUsersRepository } from "@/lib/repositories/admin-users";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Credenciais invalidas");
    this.name = "InvalidCredentialsError";
  }
}

export type AdminLoginOutput = {
  admin: AdminUser;
};

export class AdminLoginUseCase {
  constructor(private adminUsersRepo: AdminUsersRepository) {}

  async execute(username: string, password: string): Promise<AdminLoginOutput> {
    const admin = await this.adminUsersRepo.findByUsername(username);

    if (!admin) {
      throw new InvalidCredentialsError();
    }

    const passwordMatch = await compare(password, admin.passwordHash);

    if (!passwordMatch) {
      throw new InvalidCredentialsError();
    }

    return { admin };
  }
}
