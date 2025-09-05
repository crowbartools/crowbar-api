declare global {
  declare module "express-serve-static-core" {
    interface Request {
      user?: {
        twitchUsername: string;
        twitchUserId: string;
      };
    }
  }
}
