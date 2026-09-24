import { Request, Response, NextFunction } from "express";

export const observability = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${duration.toFixed(2)}ms`
    );
  });

  next();
};
