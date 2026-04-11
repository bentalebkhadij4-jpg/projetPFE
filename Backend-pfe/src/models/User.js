import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
});

// Run once to create the table if it doesn't exist
export const initUserTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id        SERIAL PRIMARY KEY,
      nom       VARCHAR(255) NOT NULL,
      prenom    VARCHAR(255) NOT NULL,
      nin       VARCHAR(255) NOT NULL UNIQUE,
      email     VARCHAR(255) NOT NULL UNIQUE,
      telephone VARCHAR(50)  NOT NULL,
      adresse   TEXT         NOT NULL,
      code_postal VARCHAR(20) NOT NULL,
      password  VARCHAR(255) NOT NULL,
      role      VARCHAR(20)  NOT NULL DEFAULT 'citoyen' CHECK (role IN ('citoyen', 'admin', 'agent')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

// ── Helpers that mirror your Mongoose instance methods ──────────────────────

export const crypterPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const comparePassword = async (candidatePassword, hashedPassword) => {
  if (!hashedPassword) {
    console.log('ERREUR: Password not from DB!');
    return false;
  }
  return bcrypt.compare(candidatePassword, hashedPassword);
};

// ── CRUD operations ──────────────────────────────────────────────────────────

export const User = {

  // Create a new user (hashes password automatically)
  async create({ nom, prenom, nin, email, telephone, adresse, codePostal, password, role = 'citoyen' }) {
    const hashed = await crypterPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (nom, prenom, nin, email, telephone, adresse, code_postal, password, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, nom, prenom, nin, email, telephone, adresse, code_postal, role, created_at`,
      [nom, prenom, nin, email.toLowerCase(), telephone, adresse, codePostal, hashed, role]
    );
    return rows[0];
  },

  // Find user by email — includes password only when needed for auth
  async findByEmail(email, { includePassword = false } = {}) {
    const fields = includePassword
      ? 'id, nom, prenom, nin, email, telephone, adresse, code_postal, role, created_at, password'
      : 'id, nom, prenom, nin, email, telephone, adresse, code_postal, role, created_at';

    const { rows } = await pool.query(
      `SELECT ${fields} FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  },

  // Find user by ID
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, nom, prenom, nin, email, telephone, adresse, code_postal, role, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Update user fields
  async updateById(id, fields) {
    const keys   = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys
      .map((k, i) => `${k} = $${i + 1}`)
      .join(', ');

    const { rows } = await pool.query(
      `UPDATE users SET ${setClause}
       WHERE id = $${keys.length + 1}
       RETURNING id, nom, prenom, nin, email, telephone, adresse, code_postal, role, created_at`,
      [...values, id]
    );
    return rows[0] || null;
  },

  // Delete user
  async deleteById(id) {
    const { rowCount } = await pool.query(
      `DELETE FROM users WHERE id = $1`, [id]
    );
    return rowCount > 0;
  },
};

export default pool;