import { pbkdf2 } from 'node:crypto';
import { promisify } from 'node:util';
import { fetchAllData } from './engine';

const pbkdf2Async = promisify(pbkdf2);

// Simulates heavy processing. pbkdf2 runs on the libuv threadpool,
// so the pool size directly limits how many jobs run in parallel.
async function heavyProcess(jobCount: number): Promise<void> {
  const jobs: Promise<Buffer>[] = [];
  for (let i = 0; i < jobCount; i++) {
    jobs.push(pbkdf2Async(`record-${i}`, 'salt', 200_000, 64, 'sha512'));
  }
  await Promise.all(jobs);
}

async function main(): Promise<void> {
  console.log(`Threadpool size: ${process.env.UV_THREADPOOL_SIZE ?? '4 (default)'}`);

  const t0 = performance.now();
  const data = await fetchAllData();
  console.log(`\nFetched in ${(performance.now() - t0).toFixed(0)}ms`);
  console.log(
    `Users: ${data.users.length}, Posts: ${data.posts.length}, ` +
    `Todos: ${data.todos.length}, Errors: ${data.errors.length}`,
  );
  console.log('Sample user:', data.users[0]);
  console.log('Errors:', data.errors);

  const t1 = performance.now();
  await heavyProcess(32);
  console.log(`Heavy processing (32 pbkdf2 jobs): ${(performance.now() - t1).toFixed(0)}ms`);
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});