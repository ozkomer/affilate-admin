import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use DIRECT_URL if available, otherwise use DATABASE_URL without pgbouncer
let connectionString = process.env.DIRECT_URL || 
  (process.env.DATABASE_URL?.replace('?pgbouncer=true', '').replace('&pgbouncer=true', ''));

if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL environment variable is not set');
}

// If DIRECT_URL doesn't work, try using pooler format
// Convert postgresql:// to postgres:// if needed
if (connectionString.startsWith('postgresql://')) {
  connectionString = connectionString.replace('postgresql://', 'postgres://');
}

// Create the connection with increased timeout
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30, // Increased from 10 to 30 seconds
  max_lifetime: 60 * 30, // 30 minutes
});

// Create the drizzle instance
export const db = drizzle(client, { schema });

