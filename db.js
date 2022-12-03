const fs = require("fs");

<<<<<<< HEAD
const sqlite3 = require("sqlite3").verbose();
const db = {
    ibrahim: new sqlite3.Database("../daten/ibrahim"),
    fatih: new sqlite3.Database("../daten/fatih")
};
=======
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect();
>>>>>>> 4b520b6f2b1ccc901f2d96843959323c5dbd18ce

const regulars = JSON.parse(fs.readFileSync("./regulars.json").toString());

async function sql(user, command) {
    return await query(user, command);
}

async function selectAll(user) {
    return await query(user, `SELECT id, amount, description, settled, date_ as "date", deductionType, vat_included, money_transfer FROM transactions ORDER BY date_ DESC, id DESC`);
}

async function setVatIncluded(user, id, vat_included) {
    await exec(user, `UPDATE transactions SET vat_included = ${vat_included} WHERE id = ${id}`);
    return await selectAll(user);
}

async function setMoneyTransfer(user, id, money_transfer) {
    await exec(user, `UPDATE transactions SET money_transfer = ${money_transfer} WHERE id = ${id}`);
    return await selectAll(user);
}

async function insertTx(user, date, amount, description) {
    await exec(user, `INSERT INTO transactions (date_, amount, description, settled) VALUES (${string(date)}, ${amount}, ${string(description)}, null)`);
    return selectAll(user);
}

async function insertTxRegulars(user, date) {
    for (const regular of regulars) {
        await exec(user, `INSERT INTO transactions (date_, amount, description, settled, deductionType, vat_included, money_transfer) VALUES (
            ${string(date)}, -0.01, ${string(regular.description)}, ${string(regular.settled)}, ${string(regular.deductiontype)}, ${regular.vat_included}, ${regular.money_transfer}
        )`);
    }
    return await selectAll(user);
}

async function settleTx(user, id, settled) {
    await exec(user, `UPDATE transactions SET settled = ${string(settled)} WHERE id = ${id}`);
    return await selectAll(user);
}

async function updateTx(user, id, date, amount, description) {
    await exec(user, `UPDATE transactions SET date_ = ${string(date)}, amount = ${amount}, description = ${string(description)} WHERE id = ${id}`);
    return await selectAll(user);
}

async function deleteTx(user, id) {
    await exec(user, `DELETE FROM transactions WHERE id = ${id}`);
    return await selectAll(user);
}

function query(user, command) {
    return new Promise((resolve, reject) => {
        db[user].serialize(() => {
            const results = [];
            db[user].each(command, (error, row) => {
                if (error) reject(error);
                else results.push(row);
            }, (error, count) => {
                if (error) reject(error);
                else resolve(results);
            })
        });
    });
}

function exec(user, command) {
    return new Promise((resolve, reject) => {
        db[user].serialize(() => {
            db[user].run(command, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    });
}

function string(value) {
    return !!value ? "'" + value + "'" : "null";
}

<<<<<<< HEAD
module.exports = { sql, selectAll, setVatIncluded, setMoneyTransfer, insertTx, insertTxRegulars, settleTx, updateTx, deleteTx, exec, query };
=======
module.exports = { sql, selectAll, setVatIncluded, setMoneyTransfer, insertTx, insertTxRegulars, settleTx, updateTx, deleteTx };
>>>>>>> 4b520b6f2b1ccc901f2d96843959323c5dbd18ce
