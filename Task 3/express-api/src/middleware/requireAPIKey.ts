import { Request, Response, NextFunction } from "express";

const API_KEY = "my-secret-key";

export const requireAPIKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const providedKey = req.header("x-api-key");

  if (!providedKey || providedKey !== API_KEY) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing API key"
    });
    return;
  }

  next();
};
