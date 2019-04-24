const { Client } = require("pg");

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

client.connect();

client.query("CREATE TABLE IF NOT EXISTS transactions")

module.exports = {
    createTable: async function () {
        const result = await client.query(`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            date_ DATE NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            description TEXT NOT NULL,
            settled DATE
        );`);
    },
    selectAll: async function () {
        const result = await client.query(`SELECT * FROM transactions`);
        return result.rows;
    }
};