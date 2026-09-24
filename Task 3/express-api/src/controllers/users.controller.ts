import { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../services/users.service";

export const getUsers = (_req: Request, res: Response): void => {
  res.status(200).json(getAllUsers());
};

export const getUser = (req: Request, res: Response): void => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const user = getUserById(id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json(user);
};

export const addUser = (req: Request, res: Response): void => {
  const { name, email } = req.body;

  if (typeof name !== "string" || typeof email !== "string") {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  const user = createUser(name, email);
  res.status(201).json(user);
};

export const editUser = (req: Request, res: Response): void => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const { name, email } = req.body;

  if (typeof name !== "string" || typeof email !== "string") {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  const updatedUser = updateUser(id, name, email);

  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json(updatedUser);
};

export const removeUser = (req: Request, res: Response): void => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const deletedUser = deleteUser(id);

  if (!deletedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json({
    message: "User deleted successfully",
    user: deletedUser
  });
};
