import {
  eq,
  or,
  like,
  inArray,
  asc,
  desc,
  sql,
  getTableColumns,
} from "drizzle-orm";

function sanitizePayload(payload, extraFields = []) {
  if (!payload || typeof payload !== "object") return payload;

  const forbidden = new Set(["id", "createdAt", "created_at", ...extraFields]);
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !forbidden.has(key)),
  );
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function normalizeCreditPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;

  return {
    clientId: firstDefined(payload.clientId, payload.client_id),
    amount: Number(payload.amount),
    feesQty: Number(firstDefined(payload.feesQty, payload.fees_qty)),
    feeAmount: Number(firstDefined(payload.feeAmount, payload.fee_amount)),
    interestRate: Number(
      firstDefined(payload.interestRate, payload.interest_rate, 0),
    ),
    startDate: firstDefined(payload.startDate, payload.start_date),
    status: firstDefined(payload.status, "active"),
  };
}

function normalizeFeesPayload(payload) {
  const list = Array.isArray(payload) ? payload : [];
  return list.map((item) => ({
    creditId: Number(firstDefined(item.creditId, item.credit_id)),
    amount: Number(item.amount),
    amountPaid: Number(firstDefined(item.amountPaid, item.amount_paid, 0)),
    expirateAt: firstDefined(item.expirateAt, item.expirate_at, item.due_date),
    status: Boolean(firstDefined(item.status, false)),
    paidAt: firstDefined(item.paidAt, item.paid_at),
    receiptNumber: firstDefined(item.receiptNumber, item.receipt_number),
  }));
}

// Selección compuesta: columnas del crédito + datos del cliente asociado.
// getTableColumns evita listar cada campo a mano y funciona igual en ambos dialectos.
function creditWithClientSelection(schema) {
  return {
    ...getTableColumns(schema.credits),
    clientName: sql`${schema.clients.name} || ' ' || ${schema.clients.lastname}`,
    doc: schema.clients.doc,
    clientEmail: schema.clients.email,
    clientPhone: schema.clients.phone,
    clientAddress: schema.clients.address,
  };
}

export const repository = {
  // --- Clients ---
  async listClients(db, schema) {
    return db
      .select()
      .from(schema.clients)
      .orderBy(desc(schema.clients.createdAt));
  },

  async createClient(db, schema, c) {
    await db.insert(schema.clients).values(sanitizePayload(c));
    return { success: true };
  },

  async updateClient(db, schema, c) {
    const { id, ...rest } = c || {};
    await db
      .update(schema.clients)
      .set(sanitizePayload(rest))
      .where(eq(schema.clients.id, id));
    return { success: true };
  },

  async searchClients(db, schema, term) {
    const like_ = `%${term}%`;
    return db
      .select()
      .from(schema.clients)
      .where(
        or(
          like(schema.clients.name, like_),
          like(schema.clients.lastname, like_),
          like(schema.clients.doc, like_),
        ),
      )
      .orderBy(desc(schema.clients.createdAt));
  },

  async getClientById(db, schema, id) {
    const rows = await db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, id));
    return rows[0];
  },

  async removeClient(db, schema, id) {
    await db.delete(schema.clients).where(eq(schema.clients.id, id));
    return { success: true };
  },

  // --- Credits ---
  async listCreditsByClient(db, schema, clientId) {
    return db
      .select()
      .from(schema.credits)
      .where(eq(schema.credits.clientId, clientId))
      .orderBy(desc(schema.credits.id));
  },

  async getCreditById(db, schema, id) {
    const rows = await db
      .select(creditWithClientSelection(schema))
      .from(schema.credits)
      .innerJoin(schema.clients, eq(schema.credits.clientId, schema.clients.id))
      .where(
        sql`${schema.credits.status} = 'active' AND ${schema.credits.id} = ${id}`,
      );
    return rows[0];
  },

  async listAllCredits(db, schema) {
    return db
      .select(creditWithClientSelection(schema))
      .from(schema.credits)
      .innerJoin(schema.clients, eq(schema.credits.clientId, schema.clients.id))
      .where(eq(schema.credits.status, "active"))
      .orderBy(desc(schema.credits.id));
  },

  async searchCredits(db, schema, term) {
    const like_ = `%${term}%`;
    return db
      .select(creditWithClientSelection(schema))
      .from(schema.credits)
      .innerJoin(schema.clients, eq(schema.credits.clientId, schema.clients.id))
      .where(
        or(
          like(schema.clients.name, like_),
          like(schema.clients.lastname, like_),
          like(schema.clients.doc, like_),
        ),
      )
      .orderBy(desc(schema.credits.id));
  },

  async createCredit(db, schema, cr) {
    const payload = normalizeCreditPayload(sanitizePayload(cr));
    await db.insert(schema.credits).values({ ...payload, status: "active" });
    return { success: true };
  },

  async updateCredit(db, schema, cr) {
    const { id } = cr || {};
    const payload = normalizeCreditPayload(sanitizePayload(cr));
    await db
      .update(schema.credits)
      .set(payload)
      .where(eq(schema.credits.id, id));
    return { success: true };
  },

  async updateCreditStatus(db, schema, { id, status }) {
    await db
      .update(schema.credits)
      .set({ status })
      .where(eq(schema.credits.id, id));
    return { success: true };
  },

  // --- Payments & fees ---
  async listPaymentsByCredit(db, schema, creditId) {
    return db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.creditId, creditId))
      .orderBy(desc(schema.payments.paidAt));
  },

  async registerPayment(db, schema, p) {
    await db.insert(schema.payments).values(p);
    return { success: true };
  },

  async updateFeeStatus(db, schema, { id, status }) {
    await db.update(schema.fees).set({ status }).where(eq(schema.fees.id, id));
    return { success: true };
  },

  async createFees(db, schema, payload) {
    const fees = normalizeFeesPayload(payload);
    if (fees.length === 0) {
      return { success: false, message: "No fees to create" };
    }

    await db.insert(schema.fees).values(fees);
    return { success: true };
  },

  async updateFees(db, schema, feeId, payload) {
    const fees = normalizeFeesPayload(payload);

    let creditId = Number(firstDefined(fees[0]?.creditId));
    if (!creditId && feeId) {
      const existing = await db
        .select({ creditId: schema.fees.creditId })
        .from(schema.fees)
        .where(eq(schema.fees.id, Number(feeId)));
      creditId = existing[0]?.creditId;
    }

    if (!creditId) {
      return { success: false, message: "Missing creditId for fees update" };
    }

    await db.delete(schema.fees).where(eq(schema.fees.creditId, creditId));
    if (fees.length > 0) {
      await db
        .insert(schema.fees)
        .values(fees.map((item) => ({ ...item, creditId })));
    }

    return { success: true };
  },

  async listFeesByCredit(db, schema, creditId) {
    return db
      .select()
      .from(schema.fees)
      .where(eq(schema.fees.creditId, creditId))
      .orderBy(asc(schema.fees.expirateAt));
  },

  async getFeesByClient(db, schema, clientId) {
    const creditIds = db
      .select({ id: schema.credits.id })
      .from(schema.credits)
      .where(eq(schema.credits.clientId, clientId));

    return db
      .select()
      .from(schema.fees)
      .where(inArray(schema.fees.creditId, creditIds))
      .orderBy(asc(schema.fees.expirateAt));
  },
};
