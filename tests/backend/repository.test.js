import test from "node:test";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../../electron/db/schema.sqlite.js";
import { repository } from "../../electron/db/repository.js";

function createTestContext() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc TEXT,
      name TEXT NOT NULL,
      lastname TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE credits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      fees_qty INTEGER NOT NULL,
      fee_amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      start_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(client_id) REFERENCES clients(id)
    );

    CREATE TABLE fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credit_id INTEGER NOT NULL,
      paid_at TEXT,
      receipt_number TEXT,
      status BOOLEAN DEFAULT false,
      amount REAL NOT NULL,
      amount_paid REAL DEFAULT 0,
      expirate_at TEXT NOT NULL,
      FOREIGN KEY(credit_id) REFERENCES credits(id)
    );

    CREATE TABLE payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credit_id INTEGER NOT NULL,
      fee_id INTEGER NOT NULL,
      paid_at TEXT NOT NULL,
      receipt_number TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY(credit_id) REFERENCES credits(id),
      FOREIGN KEY(fee_id) REFERENCES fees(id)
    );
  `);

  return {
    sqlite,
    db: drizzle(sqlite, { schema }),
    schema,
  };
}

async function createBaseClient(ctx, overrides = {}) {
  await repository.createClient(ctx.db, ctx.schema, {
    doc: "12345678",
    name: "Ana",
    lastname: "Lopez",
    email: "ana@example.com",
    phone: "555-100",
    address: "Calle 1",
    ...overrides,
  });

  const clients = await repository.listClients(ctx.db, ctx.schema);
  return clients[0];
}

test("clients CRUD and search", async () => {
  const ctx = createTestContext();
  try {
    const createRes = await repository.createClient(ctx.db, ctx.schema, {
      id: 999,
      created_at: "2025-01-01",
      doc: "DOC-001",
      name: "Carlos",
      lastname: "Gomez",
      email: "carlos@example.com",
      phone: "555-001",
      address: "Street 10",
    });
    assert.equal(createRes.success, true);

    const list1 = await repository.listClients(ctx.db, ctx.schema);
    assert.equal(list1.length, 1);
    assert.equal(list1[0].name, "Carlos");

    const found = await repository.searchClients(ctx.db, ctx.schema, "DOC-001");
    assert.equal(found.length, 1);

    const client = list1[0];
    const updateRes = await repository.updateClient(ctx.db, ctx.schema, {
      id: client.id,
      name: "Carlos Alberto",
      phone: "555-999",
      created_at: "ignored",
    });
    assert.equal(updateRes.success, true);

    const updated = await repository.getClientById(
      ctx.db,
      ctx.schema,
      client.id,
    );
    assert.equal(updated.name, "Carlos Alberto");
    assert.equal(updated.phone, "555-999");

    const removeRes = await repository.removeClient(
      ctx.db,
      ctx.schema,
      client.id,
    );
    assert.equal(removeRes.success, true);

    const list2 = await repository.listClients(ctx.db, ctx.schema);
    assert.equal(list2.length, 0);
  } finally {
    ctx.sqlite.close();
  }
});

test("credits flow: create, search, update and soft delete", async () => {
  const ctx = createTestContext();
  try {
    const client = await createBaseClient(ctx, {
      doc: "CC-01",
      name: "Maria",
      lastname: "Perez",
    });

    const createCreditRes = await repository.createCredit(ctx.db, ctx.schema, {
      client_id: client.id,
      amount: 1200,
      fees_qty: 6,
      fee_amount: 200,
      interest_rate: 5,
      start_date: "2026-01-10",
    });
    assert.equal(createCreditRes.success, true);

    const byClient = await repository.listCreditsByClient(
      ctx.db,
      ctx.schema,
      client.id,
    );
    assert.equal(byClient.length, 1);

    const active = await repository.listAllCredits(ctx.db, ctx.schema);
    assert.equal(active.length, 1);
    assert.equal(active[0].clientName, "Maria Perez");

    const searched = await repository.searchCredits(
      ctx.db,
      ctx.schema,
      "Perez",
    );
    assert.equal(searched.length, 1);

    const credit = byClient[0];
    const updateRes = await repository.updateCredit(ctx.db, ctx.schema, {
      id: credit.id,
      client_id: client.id,
      amount: 1500,
      fees_qty: 5,
      fee_amount: 300,
      interest_rate: 7,
      start_date: "2026-02-01",
      status: "active",
    });
    assert.equal(updateRes.success, true);

    const updatedRows = await repository.listCreditsByClient(
      ctx.db,
      ctx.schema,
      client.id,
    );
    assert.equal(updatedRows[0].amount, 1500);
    assert.equal(updatedRows[0].feesQty, 5);

    const statusRes = await repository.updateCreditStatus(ctx.db, ctx.schema, {
      id: credit.id,
      status: "inactive",
    });
    assert.equal(statusRes.success, true);

    const activeAfter = await repository.listAllCredits(ctx.db, ctx.schema);
    assert.equal(activeAfter.length, 0);

    const getInactive = await repository.getCreditById(
      ctx.db,
      ctx.schema,
      credit.id,
    );
    assert.equal(getInactive, undefined);
  } finally {
    ctx.sqlite.close();
  }
});

test("fees and payments flow", async () => {
  const ctx = createTestContext();
  try {
    const client = await createBaseClient(ctx, {
      doc: "CC-02",
      name: "Luis",
      lastname: "Martinez",
    });

    await repository.createCredit(ctx.db, ctx.schema, {
      client_id: client.id,
      amount: 1000,
      fees_qty: 2,
      fee_amount: 500,
      interest_rate: 0,
      start_date: "2026-03-01",
    });

    const credit = (
      await repository.listCreditsByClient(ctx.db, ctx.schema, client.id)
    )[0];

    const emptyFeesRes = await repository.createFees(ctx.db, ctx.schema, []);
    assert.equal(emptyFeesRes.success, false);

    const createFeesRes = await repository.createFees(ctx.db, ctx.schema, [
      {
        credit_id: credit.id,
        amount: 500,
        due_date: "2026-03-10",
      },
      {
        credit_id: credit.id,
        amount: 500,
        due_date: "2026-04-10",
      },
    ]);
    assert.equal(createFeesRes.success, true);

    const fees = await repository.listFeesByCredit(
      ctx.db,
      ctx.schema,
      credit.id,
    );
    assert.equal(fees.length, 2);
    assert.equal(fees[0].expirateAt, "2026-03-10");

    const feeByClient = await repository.getFeesByClient(
      ctx.db,
      ctx.schema,
      client.id,
    );
    assert.equal(feeByClient.length, 2);

    const feeStatusRes = await repository.updateFeeStatus(ctx.db, ctx.schema, {
      id: fees[0].id,
      status: true,
    });
    assert.equal(feeStatusRes.success, true);

    const updateFeesRes = await repository.updateFees(
      ctx.db,
      ctx.schema,
      fees[0].id,
      [
        {
          amount: 400,
          due_date: "2026-05-10",
        },
        {
          amount: 600,
          due_date: "2026-06-10",
        },
      ],
    );
    assert.equal(updateFeesRes.success, true);

    const replacedFees = await repository.listFeesByCredit(
      ctx.db,
      ctx.schema,
      credit.id,
    );
    assert.equal(replacedFees.length, 2);
    assert.equal(replacedFees[0].expirateAt, "2026-05-10");
    assert.equal(replacedFees[1].expirateAt, "2026-06-10");

    const payment1 = await repository.registerPayment(ctx.db, ctx.schema, {
      creditId: credit.id,
      feeId: replacedFees[0].id,
      paidAt: "2026-03-11",
      receiptNumber: "R-001",
      amount: 500,
    });
    assert.equal(payment1.success, true);

    const payment2 = await repository.registerPayment(ctx.db, ctx.schema, {
      creditId: credit.id,
      feeId: replacedFees[1].id,
      paidAt: "2026-04-11",
      receiptNumber: "R-002",
      amount: 500,
    });
    assert.equal(payment2.success, true);

    const payments = await repository.listPaymentsByCredit(
      ctx.db,
      ctx.schema,
      credit.id,
    );
    assert.equal(payments.length, 2);
    assert.equal(payments[0].receiptNumber, "R-002");
  } finally {
    ctx.sqlite.close();
  }
});
