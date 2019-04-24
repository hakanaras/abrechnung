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
    const result = await client.query(`SELECT * FROM transactions`);
    return result.rows;
}

async function insertTx() {
    const result = await client.query(`INSERT INTO transactions VALUES ($1, $2, $3, $4)`, [date, amount, description, null]);
    return selectAll();
}

module.exports = { createTable, selectAll, insertTx };