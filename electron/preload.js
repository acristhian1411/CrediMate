const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("setupApi", {
  hasConfig: () => ipcRenderer.invoke("setup:has-config"),
  getConfig: () => ipcRenderer.invoke("setup:get-config"),
  testPostgres: (config) => ipcRenderer.invoke("setup:test-postgres", config),
  saveConfig: (config) => ipcRenderer.invoke("setup:save-config", config),
});

contextBridge.exposeInMainWorld("migrationApi", {
  getCurrentConfig: () => ipcRenderer.invoke("migration:get-current-config"),
  run: (payload) => ipcRenderer.invoke("migration:run", payload),
});

contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
  clients: {
    list: () => ipcRenderer.invoke("clients:list"),
    create: (data) => ipcRenderer.invoke("clients:create", data),
    update: (data) => ipcRenderer.invoke("clients:update", data),
    search: (searchTerm) => ipcRenderer.invoke("clients:search", searchTerm),
    getById: (id) => ipcRenderer.invoke("clients:getById", id),
    remove: (id) => ipcRenderer.invoke("clients:remove", id),
  },
  credits: {
    listByClient: (clientId) =>
      ipcRenderer.invoke("credits:listByClient", clientId),
    listAll: () => ipcRenderer.invoke("credits:listAll"),
    search: (searchTerm) => ipcRenderer.invoke("credits:search", searchTerm),
    getById: (id) => ipcRenderer.invoke("credits:getById", id),
    create: (data) => ipcRenderer.invoke("credits:create", data),
    update: (data) => ipcRenderer.invoke("credits:update", data),
    updateStatus: (data) => ipcRenderer.invoke("credits:updateStatus", data),
  },
  payments: {
    listByCredit: (creditId) =>
      ipcRenderer.invoke("payments:listByCredit", creditId),
    register: (data) => ipcRenderer.invoke("payments:register", data),
  },
  print: {
    contract: (data) => ipcRenderer.invoke("print:contract", data),
    receipt: (data) => ipcRenderer.invoke("print:receipt", data),
  },
  fees: {
    listByCredit: (creditId) =>
      ipcRenderer.invoke("fees:listByCredit", creditId),
    create: (data) => ipcRenderer.invoke("fees:create", data),
    update: (id, fees) => ipcRenderer.invoke("fees:update", { id, fees }),
    updateStatus: (data) => ipcRenderer.invoke("fees:updateStatus", data),
    getAllByCredit: (creditId) =>
      ipcRenderer.invoke("fees:getAllByCredit", creditId),
    getByClient: (clientId) => ipcRenderer.invoke("fees:getByClient", clientId),
  },
});
