import { getDbClient } from "./db/client.js";
import { repository } from "./db/repository.js";

async function resolveContext(context) {
  if (context && context.db && context.schema) {
    return context;
  }

  return getDbClient();
}

export async function initDB(dbPath) {
  return getDbClient(dbPath);
}

export const dbAPI = {
  listClients: async (context) => {
    const { db, schema } = await resolveContext(context);
    return repository.listClients(db, schema);
  },

  createClient: async (context, c) => {
    const { db, schema } = await resolveContext(context);
    return repository.createClient(db, schema, c);
  },

  updateClient: async (context, c) => {
    const { db, schema } = await resolveContext(context);
    return repository.updateClient(db, schema, c);
  },

  searchClients: async (context, searchTerm) => {
    const { db, schema } = await resolveContext(context);
    return repository.searchClients(db, schema, searchTerm);
  },

  getClientById: async (context, id) => {
    const { db, schema } = await resolveContext(context);
    return repository.getClientById(db, schema, id);
  },

  removeClient: async (context, id) => {
    const { db, schema } = await resolveContext(context);
    return repository.removeClient(db, schema, id);
  },

  listCreditsByClient: async (context, clientId) => {
    const { db, schema } = await resolveContext(context);
    return repository.listCreditsByClient(db, schema, clientId);
  },

  getCreditById: async (context, id) => {
    const { db, schema } = await resolveContext(context);
    return repository.getCreditById(db, schema, id);
  },

  listAllCredits: async (context) => {
    const { db, schema } = await resolveContext(context);
    return repository.listAllCredits(db, schema);
  },

  searchCredits: async (context, searchTerm) => {
    const { db, schema } = await resolveContext(context);
    return repository.searchCredits(db, schema, searchTerm);
  },

  createCredit: async (context, cr) => {
    const { db, schema } = await resolveContext(context);
    return repository.createCredit(db, schema, cr);
  },

  updateCredit: async (context, cr) => {
    const { db, schema } = await resolveContext(context);
    return repository.updateCredit(db, schema, cr);
  },

  updateCreditStatus: async (context, payload) => {
    const { db, schema } = await resolveContext(context);
    return repository.updateCreditStatus(db, schema, payload);
  },

  listPaymentsByCredit: async (context, creditId) => {
    const { db, schema } = await resolveContext(context);
    return repository.listPaymentsByCredit(db, schema, creditId);
  },

  registerPayment: async (context, payload) => {
    const { db, schema } = await resolveContext(context);
    return repository.registerPayment(db, schema, payload);
  },

  updateFeeStatus: async (context, payload) => {
    const { db, schema } = await resolveContext(context);
    return repository.updateFeeStatus(db, schema, payload);
  },

  createFees: async (context, payload) => {
    const { db, schema } = await resolveContext(context);
    return repository.createFees(db, schema, payload);
  },

  updateFees: async (context, payload) => {
    const { db, schema } = await resolveContext(context);
    const { id, fees } = payload || {};
    return repository.updateFees(db, schema, id, fees);
  },

  listFeesByCredit: async (context, creditId) => {
    const { db, schema } = await resolveContext(context);
    return repository.listFeesByCredit(db, schema, creditId);
  },

  getFeesByClient: async (context, clientId) => {
    const { db, schema } = await resolveContext(context);
    return repository.getFeesByClient(db, schema, clientId);
  },
};
