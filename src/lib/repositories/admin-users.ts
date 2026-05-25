export type AdminUser = {
  id: number;
  username: string;
  passwordHash: string;
};

export interface AdminUsersRepository {
  findByUsername(username: string): Promise<AdminUser | undefined>;
}
