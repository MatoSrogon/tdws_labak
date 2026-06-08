declare namespace Express {
  export interface Locals {
    isAuthenticated: boolean;
    user: {
      id: number;
      email: string;
      name: string;
      isAdmin: number;
    } | null;
  }
}
