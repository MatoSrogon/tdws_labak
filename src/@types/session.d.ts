import "express-session";

declare module "express-session" {
  interface SessionData {
    isAuthenticated: boolean;
    user: {
      id: number;
      email: string;
      name: string;
      isAdmin: number;
    } | null;
    errorMessage: string;
    formData: unknown | null;
    error: unknown | null;
    redirectPath: string | null;
  }
}
