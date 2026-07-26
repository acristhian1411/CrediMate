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

  async createCredit(db, schema, cr) {
    const payload = sanitizePayload(cr);
    await db.insert(schema.credits).values({ ...payload, status: "active" });
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
