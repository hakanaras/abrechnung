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
    const result = await client.query(`SELECT id, amount, description, TO_CHAR(settled, 'YYYY-MM-DD') as "settled", TO_CHAR(date_, 'YYYY-MM-DD') as \"date\" FROM transactions ORDER BY date_ DESC, id DESC`);
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

async function updateTx(id, date, amount, description) {
    const result = await client.query(`UPDATE transactions SET date_ = $1, amount = $2, description = $3 WHERE id = $4`, [date, amount, description, id]);
    return selectAll();
}

async function deleteTx(id) {
    const result = await client.query(`DELETE FROM transactions WHERE id = $1`, [id]);
    return selectAll();
}

module.exports = { createTable, selectAll, insertTx, settleTx, updateTx, deleteTx };