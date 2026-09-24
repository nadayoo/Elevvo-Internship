import express from "express";
import usersRouter from "./routes/users.routes";
import { observability } from "./middleware/observability";
import { requireAPIKey } from "./middleware/requireAPIKey";

const app = express();

app.use(observability);
app.use(express.json());
app.use(requireAPIKey);

app.use("/api/users", usersRouter);

app.use((_req: express.Request, res: express.Response): void => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
