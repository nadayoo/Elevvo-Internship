import type { User, Post, Todo, EndpointError, EngineResult } from './types';

const BASE = 'https://dummyjson.com';

// ---------- Type guard: narrows `unknown` to a plain object ----------
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ---------- Mappers: raw unknown JSON -> strict domain types ----------
function mapUser(raw: unknown): User | null {
  if (!isRecord(raw)) return null;
  const { id, firstName, lastName, email, address, company } = raw;
  if (
    typeof id !== 'number' || typeof firstName !== 'string' ||
    typeof lastName !== 'string' || typeof email !== 'string'
  ) {
    return null;
  }
  const city = isRecord(address) && typeof address.city === 'string' ? address.city : 'Unknown';
  const companyName = isRecord(company) && typeof company.name === 'string' ? company.name : 'Unknown';
  return { id, name: `${firstName} ${lastName}`, email, city, company: companyName };
}

function mapPost(raw: unknown): Post | null {
  if (!isRecord(raw)) return null;
  const { id, userId, title, body } = raw;
  if (
    typeof id !== 'number' || typeof userId !== 'number' ||
    typeof title !== 'string' || typeof body !== 'string'
  ) {
    return null;
  }
  return { id, userId, title, body };
}

function mapTodo(raw: unknown): Todo | null {
  if (!isRecord(raw)) return null;
  const { id, userId, todo, completed } = raw;
  if (
    typeof id !== 'number' || typeof userId !== 'number' ||
    typeof todo !== 'string' || typeof completed !== 'boolean'
  ) {
    return null;
  }
  return { id, userId, title: todo, completed };
}

// ---------- Generic fetcher ----------
// dummyjson returns { users: [...] } / { posts: [...] } / { todos: [...] },
// so `key` says which property holds the array.
async function fetchCollection<T>(
  url: string,
  key: string,
  mapper: (raw: unknown) => T | null,
): Promise<T[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }

  const raw: unknown = await res.json();
  if (!isRecord(raw)) {
    throw new Error(`Expected a JSON object from ${url}`);
  }

  const list = raw[key];
  if (!Array.isArray(list)) {
    throw new Error(`Expected a "${key}" array in the response from ${url}`);
  }

  const entries: unknown[] = list;
  const items: T[] = [];
  for (const entry of entries) {
    const mapped = mapper(entry);
    if (mapped !== null) items.push(mapped); // silently drop malformed records
  }
  return items;
}

// ---------- Error isolation helpers ----------
function describeError(reason: unknown): string {
  if (reason instanceof Error) {
    const cause: unknown = reason.cause;
    return cause instanceof Error ? `${reason.message} (${cause.message})` : reason.message;
  }
  return String(reason);
}

function unwrap<T>(
  name: string,
  result: PromiseSettledResult<T[]>,
  errors: EndpointError[],
): T[] {
  if (result.status === 'fulfilled') return result.value;

  const message = describeError(result.reason);
  errors.push({ endpoint: name, message });
  console.error(`[engine] "${name}" failed: ${message}`);
  return []; // failed endpoint -> empty array, everything else continues
}

// ---------- The engine ----------
export async function fetchAllData(): Promise<EngineResult> {
  // All five requests start immediately and run concurrently.
  const [usersRes, postsRes, todosRes, notFoundRes, unreachableRes] =
    await Promise.allSettled([
      fetchCollection(`${BASE}/users?limit=0`, 'users', mapUser),
      fetchCollection(`${BASE}/posts?limit=0`, 'posts', mapPost),
      fetchCollection(`${BASE}/todos?limit=0`, 'todos', mapTodo),
      // Two deliberately broken endpoints to prove fault tolerance:
      fetchCollection(`${BASE}/this-route-does-not-exist`, 'todos', mapTodo),
      fetchCollection('https://no-such-host.invalid/data', 'todos', mapTodo),
    ]);

  const errors: EndpointError[] = [];
  const users = unwrap('users', usersRes, errors);
  const posts = unwrap('posts', postsRes, errors);
  const todos = unwrap('todos', todosRes, errors);
  unwrap('broken-404', notFoundRes, errors);
  unwrap('unreachable-host', unreachableRes, errors);

  return { users, posts, todos, errors };
}