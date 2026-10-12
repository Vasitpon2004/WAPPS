export type Role = 'student' | 'professor' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}