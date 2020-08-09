const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

client.connect();

const regulars = JSON.parse(fs.readFileSync("./regulars.json").toString());

async function sql(command) {
    const result = await client.query(command);
    return result;
}

async function selectAll() {
    const result = await client.query(`SELECT id, amount, description, TO_CHAR(settled, 'YYYY-MM-DD') as "settled", TO_CHAR(date_, 'YYYY-MM-DD') as \"date\", deductionType, vat_included, money_transfer FROM transactions ORDER BY date_ DESC, id DESC`);
    return result.rows;
}

async function setVatIncluded(id, vatIncluded) {
    const result = await client.query(`UPDATE transactions SET vat_included = $1 WHERE id = $2`, [vatIncluded, id]);
    return selectAll();
}

async function setMoneyTransfer(id, money_transfer) {
    const result = await client.query(`UPDATE transactions SET money_transfer = $1 WHERE id = $2`, [money_transfer, id]);
    return selectAll();
}

async function insertTx(date, amount, description) {
    const result = await client.query(`INSERT INTO transactions (date_, amount, description, settled) VALUES ($1, $2, $3, $4)`, [date, amount, description, null]);
    return selectAll();
}

async function insertTxRegulars(date) {
    for (const regular in regulars) {
        await client.query(`INSERT INTO transactions (date_, amount, description, settled, deductionType, vat_included, money_transfer) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [date, regular.amount, regular.description, regular.settled, regular.deductiontype, regular.vat_included, regular.money_transfer]);
    }
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

module.exports = { sql, selectAll, setVatIncluded, setMoneyTransfer, insertTx, insertTxRegulars, settleTx, updateTx, deleteTx };