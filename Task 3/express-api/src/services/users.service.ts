import { User } from "../types";

let users: User[] = [
  { id: 1, name: "Ahmed", email: "ahmed@example.com" },
  { id: 2, name: "Sara", email: "sara@example.com" }
];

let nextId = 3;

export const getAllUsers = (): User[] => users;

export const getUserById = (id: number): User | undefined =>
  users.find((user) => user.id === id);

export const createUser = (name: string, email: string): User => {
  const newUser: User = { id: nextId++, name, email };
  users.push(newUser);
  return newUser;
};

export const updateUser = (
  id: number,
  name: string,
  email: string
): User | undefined => {
  const user = users.find((user) => user.id === id);
  if (!user) return undefined;

  user.name = name;
  user.email = email;
  return user;
};

export const deleteUser = (id: number): User | undefined => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return undefined;

  const deletedUser = users[index];
  users.splice(index, 1);
  return deletedUser;
};
