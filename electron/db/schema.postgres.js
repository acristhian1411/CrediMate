import { pgTable, serial, integer, text, doublePrecision, boolean, timestamp } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  doc: text('doc'),
  name: text('name').notNull(),
  lastname: text('lastname'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const credits = pgTable('credits', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  amount: doublePrecision('amount').notNull(),
  feesQty: integer('fees_qty').notNull(),
  feeAmount: doublePrecision('fee_amount').notNull(),
  interestRate: doublePrecision('interest_rate').notNull(),
  startDate: text('start_date').notNull(),
  status: text('status').default('active'),
});

export const fees = pgTable('fees', {
  id: serial('id').primaryKey(),
  creditId: integer('credit_id').notNull().references(() => credits.id),
  paidAt: text('paid_at'),
  receiptNumber: text('receipt_number'),
  status: boolean('status').default(false),
  amount: doublePrecision('amount').notNull(),
  amountPaid: doublePrecision('amount_paid').default(0),
  expirateAt: text('expirate_at').notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  creditId: integer('credit_id').notNull().references(() => credits.id),
  feeId: integer('fee_id').notNull().references(() => fees.id),
  paidAt: text('paid_at').notNull(),
  receiptNumber: text('receipt_number').notNull(),
  amount: doublePrecision('amount').notNull(),
});
