const { Client } = require("pg");

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

client.connect();

client.query("CREATE TABLE IF NOT EXISTS transactions")

async function createTable() {
    const result = await client.query(`CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        date_ DATE NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        description TEXT NOT NULL,
        settled DATE
    );`);
}

async function selectAll() {
    const result = await client.query(`SELECT *, TO_CHAR(date_, 'YYYY-MM-DD') as \"date\" FROM transactions`);
    return result.rows;
}

async function insertTx(date, amount, description) {
    const result = await client.query(`INSERT INTO transactions (date_, amount, description, settled) VALUES ($1, $2, $3, $4)`, [date, amount, description, null]);
    return selectAll();
}

async function settleTx(id, settled) {
    const result = await client.query(`UPDATE transactions SET settled = $1 WHERE id = $2`, [settled, id]);
    return selectAll();
}

module.exports = { createTable, selectAll, insertTx, settleTx };