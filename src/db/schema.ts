import { pgTable, text, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// User table
export const users = pgTable('User', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  supabaseUserId: text('supabaseUserId').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
});

// Category table
export const categories = pgTable('Category', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
});

// EcommerceBrand table
export const ecommerceBrands = pgTable('EcommerceBrand', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  color: text('color'),
  website: text('website'),
  description: text('description'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
});

// AffiliateLink table
export const affiliateLinks = pgTable('AffiliateLink', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('description'),
  originalUrl: text('originalUrl').notNull(),
  shortUrl: text('shortUrl').notNull().unique(),
  customSlug: text('customSlug').unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('categoryId').references(() => categories.id, { onDelete: 'set null' }),
  ecommerceBrandId: text('ecommerceBrandId').references(() => ecommerceBrands.id, { onDelete: 'set null' }),
  isActive: boolean('isActive').default(true).notNull(),
  clickCount: integer('clickCount').default(0).notNull(),
  tags: text('tags').array(),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
});

// Click table
export const clicks = pgTable('Click', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  linkId: text('linkId').notNull().references(() => affiliateLinks.id, { onDelete: 'cascade' }),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  referrer: text('referrer'),
  country: text('country'),
  city: text('city'),
  device: text('device'),
  browser: text('browser'),
  converted: boolean('converted').default(false).notNull(),
  timestamp: timestamp('timestamp', { mode: 'date', withTimezone: false }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  links: many(affiliateLinks),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  links: many(affiliateLinks),
}));

export const ecommerceBrandsRelations = relations(ecommerceBrands, ({ many }) => ({
  links: many(affiliateLinks),
}));

export const affiliateLinksRelations = relations(affiliateLinks, ({ one, many }) => ({
  user: one(users, {
    fields: [affiliateLinks.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [affiliateLinks.categoryId],
    references: [categories.id],
  }),
  ecommerceBrand: one(ecommerceBrands, {
    fields: [affiliateLinks.ecommerceBrandId],
    references: [ecommerceBrands.id],
  }),
  clicks: many(clicks),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(affiliateLinks, {
    fields: [clicks.linkId],
    references: [affiliateLinks.id],
  }),
}));

