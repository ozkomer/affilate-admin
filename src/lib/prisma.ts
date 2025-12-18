import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
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
    max: 3, // Reduced from 10 to avoid pool exhaustion
    min: 0, // Allow pool to close idle connections
    idleTimeoutMillis: 10000, // Reduced from 30000
    connectionTimeoutMillis: 10000, // Reduced from 30000
    allowExitOnIdle: true, // Allow process to exit when pool is idle
  })

  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  return client
}

let prismaInstance: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prismaInstance = createPrismaClient()
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prismaInstance = globalForPrisma.prisma
}

export const prisma = prismaInstance

