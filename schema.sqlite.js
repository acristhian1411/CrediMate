import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  doc: text('doc'),
  name: text('name').notNull(),
  lastname: text('lastname'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const credits = sqliteTable('credits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: integer('client_id').notNull().references(() => clients.id),
  amount: real('amount').notNull(),
  feesQty: integer('fees_qty').notNull(),
  feeAmount: real('fee_amount').notNull(),
  interestRate: real('interest_rate').notNull(),
  startDate: text('start_date').notNull(),
  status: text('status').default('active'),
});

export const fees = sqliteTable('fees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  creditId: integer('credit_id').notNull().references(() => credits.id),
  paidAt: text('paid_at'),
  receiptNumber: text('receipt_number'),
  status: integer('status', { mode: 'boolean' }).default(false),
  amount: real('amount').notNull(),
  amountPaid: real('amount_paid').default(0),
  expirateAt: text('expirate_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  creditId: integer('credit_id').notNull().references(() => credits.id),
  feeId: integer('fee_id').notNull().references(() => fees.id),
  paidAt: text('paid_at').notNull(),
  receiptNumber: text('receipt_number').notNull(),
  amount: real('amount').notNull(),
});
