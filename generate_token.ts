import { signToken } from './src/lib/auth';

async function main() {
  const token = await signToken({ id: 'delegate-123', role: 'DIRECTOR' });
  console.log('---TOKEN---');
  console.log(token);
  console.log('---END---');
}

main().catch(console.error);
