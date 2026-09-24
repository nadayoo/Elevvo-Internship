export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  company: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface EndpointError {
  endpoint: string;
  message: string;
}

export interface EngineResult {
  users: User[];
  posts: Post[];
  todos: Todo[];
  errors: EndpointError[];
}