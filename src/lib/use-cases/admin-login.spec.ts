import { describe, it, expect } from "vitest";
import { hashSync } from "bcryptjs";
import { adminUsers } from "@/lib/db/schema";
import { createTestRepos } from "./test-helper";
import {
  AdminLoginUseCase,
  InvalidCredentialsError,
} from "./admin-login";

describe("AdminLoginUseCase", () => {
  const username = "admin";
  const password = "123456";

  function createFixture() {
    const repos = createTestRepos();
    const useCase = new AdminLoginUseCase(repos.adminUsersRepo);
    const passwordHash = hashSync(password, 10);
    repos.db.insert(adminUsers).values({ username, passwordHash }).run();
    return { useCase };
  }

  it("returns admin on valid credentials", async () => {
    const { useCase } = createFixture();
    const result = await useCase.execute(username, password);

    expect(result.admin.username).toBe(username);
    expect(result.admin.passwordHash).toBeTruthy();
  });

  it("throws InvalidCredentialsError when username does not exist", async () => {
    const { useCase } = createFixture();

    await expect(useCase.execute("wrong", password)).rejects.toThrow(InvalidCredentialsError);
  });

  it("throws InvalidCredentialsError when password is wrong", async () => {
    const { useCase } = createFixture();

    await expect(useCase.execute(username, "wrong")).rejects.toThrow(InvalidCredentialsError);
  });
});
