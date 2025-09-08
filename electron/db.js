import Database from 'better-sqlite3'

export function initDB (dbPath) {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc TEXT,
      name TEXT NOT NULL,
      lastname TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS credits (
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
    create table if not exists fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credit_id INTEGER NOT NULL,
      paid_at TEXT,
      receipt_number TEXT,
      status BOOLEAN DEFAULT false,
      amount REAL NOT NULL,
      amount_paid REAL DEFAULT 0,
      expirate_at DATE NOT NULL,
      FOREIGN KEY(credit_id) REFERENCES credits(id)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credit_id INTEGER NOT NULL,
      fee_id INTEGER NOT NULL,
      paid_at TEXT NOT NULL,
      receipt_number TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY(credit_id) REFERENCES credits(id),
      FOREIGN KEY(fee_id) REFERENCES fees(id)
    );
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
  return db
}

export const dbAPI = {
  // Clients
  listClients: (db) => db.prepare(`SELECT * FROM clients ORDER BY created_at DESC`).all(),
  createClient: (db, c) => db.prepare(`
    INSERT INTO clients (doc, name, lastname, email, phone, address)
    VALUES (@doc, @name, @lastname, @email, @phone, @address)
  `).run(c),

  updateClient: (db, c) => db.prepare(`
    UPDATE clients SET doc=@doc, name=@name, lastname=@lastname, email=@email, phone=@phone, address=@address
    WHERE id=@id
  `).run(c),

  searchClients: (db, searchTerm) => db.prepare(`
    SELECT * FROM clients WHERE name LIKE ? OR lastname LIKE ? OR doc LIKE ?
    ORDER BY created_at DESC
  `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`),

  getClientById: (db, id) => db.prepare(`SELECT * FROM clients WHERE id=?`).get(id),

  removeClient: (db, id) => db.prepare(`DELETE FROM clients WHERE id=?`).run(id),

  // Credits
  listCreditsByClient: (db, clientId) => db.prepare(`
    SELECT * FROM credits WHERE client_id=? ORDER BY id DESC
  `).all(clientId),
  getCreditById: (db, id) => db.prepare(`SELECT c.*, cl.name || ' ' || cl.lastname AS clientName,
    cl.doc AS doc,
    cl.email AS clientEmail,
    cl.phone AS clientPhone,
    cl.address AS clientAddress
    FROM credits c
    join clients cl on c.client_id = cl.id
    where c.status = 'active'
    and c.id=?`).get(id),
  listAllCredits: (db) => db.prepare(`
    SELECT c.*, cl.name || ' ' || cl.lastname AS clientName,
    cl.doc AS doc,
    cl.email AS clientEmail,
    cl.phone AS clientPhone,
    cl.address AS clientAddress
    FROM credits c
    JOIN clients cl ON c.client_id = cl.id
    where c.status = 'active'
    ORDER BY c.id DESC
  `).all(),
  createCredit: (db, cr) => db.prepare(`
    INSERT INTO credits (client_id, amount, fees_qty, fee_amount, interest_rate, start_date, status)
    VALUES (@client_id, @amount, @fees_qty, @fee_amount, @interest_rate, @start_date, 'active')
  `).run(cr),
  updateCreditStatus: (db, { id, status }) => db.prepare(`
    UPDATE credits SET status=? WHERE id=?
  `).run(status, id),

  // Payments
  listPaymentsByCredit: (db, creditId) => db.prepare(`
    SELECT * FROM payments WHERE credit_id=? ORDER BY paid_at DESC
  `).all(creditId),
  
  registerPayment: (db, p) => db.prepare(`
    INSERT INTO payments (credit_id, fee_id, paid_at, receipt_number, amount)
    VALUES (@credit_id, @fee_id, @paid_at, @receipt_number, @amount)
  `).run(p),

  updateFeeStatus: (db, { id, status }) => db.prepare(`
    UPDATE fees SET status=? WHERE id=?
  `).run(status, id),

  getAllFeesByCredit: (db, creditId) => db.prepare(`
    SELECT * FROM fees WHERE credit_id=? ORDER BY expirate_at asc
  `).all(creditId),

  getFeesByClient: (db, clientId) => db.prepare(`
    SELECT * FROM fees WHERE credit_id IN (SELECT id FROM credits WHERE client_id=?) ORDER BY expirate_at asc
  `).all(clientId)
}
