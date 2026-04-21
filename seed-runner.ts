// Seed runner — uses tsx to execute TypeScript directly
import 'dotenv/config';
import { seedDatabase } from './src/lib/seed';

async function main() {
  console.log('🌱 Running database seed...');
  await seedDatabase();
  console.log('✅ Seed complete');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });