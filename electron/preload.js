const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  clients: {
    list: () => ipcRenderer.invoke('clients:list'),
    create: (data) => ipcRenderer.invoke('clients:create', data),
    update: (data) => ipcRenderer.invoke('clients:update', data),
    remove: (id) => ipcRenderer.invoke('clients:remove', id)
  },
  credits: {
    listByClient: (clientId) => ipcRenderer.invoke('credits:listByClient', clientId),
    create: (data) => ipcRenderer.invoke('credits:create', data),
    updateStatus: (data) => ipcRenderer.invoke('credits:updateStatus', data)
  },
  payments: {
    listByCredit: (creditId) => ipcRenderer.invoke('payments:listByCredit', creditId),
    register: (data) => ipcRenderer.invoke('payments:register', data)
  },
  print: {
    contract: (data) => ipcRenderer.invoke('print:contract', data),
    receipt: (data) => ipcRenderer.invoke('print:receipt', data)
  },
  fees: {
    listByCredit: (creditId) => ipcRenderer.invoke('fees:listByCredit', creditId),
    updateStatus: (data) => ipcRenderer.invoke('fees:updateStatus', data),
    getAllByCredit: (creditId) => ipcRenderer.invoke('fees:getAllByCredit', creditId),
    getByClient: (clientId) => ipcRenderer.invoke('fees:getByClient', clientId)
  }
});
