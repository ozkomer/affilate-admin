import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function runMigration() {
  // Use DIRECT_URL if available, otherwise use DATABASE_URL without pgbouncer
  const connectionString = process.env.DIRECT_URL || 
    (process.env.DATABASE_URL?.replace('?pgbouncer=true', '').replace('&pgbouncer=true', ''))

  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set')
  }

  // Convert postgresql:// to postgres:// if needed for pg Pool
  const finalConnectionString = connectionString.startsWith('postgresql://') 
    ? connectionString.replace('postgresql://', 'postgres://')
    : connectionString

  const pool = new Pool({
    connectionString: finalConnectionString,
    max: 1,
  });

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251222135541_add_list_urls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: add_list_urls');
    console.log('Migration SQL:');
    console.log(migrationSQL);
    console.log('\n---\n');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });

