const db = require("./db");

async function init() {
    await exec("DROP TABLE IF EXISTS transactions");
    await exec(`CREATE TABLE transactions
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_ date,
        amount numeric,
        description text,
        settled date,
        deductiontype text,
        vat_included boolean,
        money_transfer boolean
    )`);

    for (const user of ["fatih", "ibrahim"]) {
        const results = await importCsv('../' + user + '-abrechnung.csv');
        console.log(user);
        console.log(results.length);
        for (const row of results) {
            await db.exec(user, `INSERT INTO transactions (date_, amount, description, settled, deductiontype, vat_included, money_transfer) VALUES
            (
                '${row.date}',
                ${row.amount},
                '${row.description}',
                ${nullableString(row.settled)},
                ${nullableString(row.deductiontype)},
                ${boolean(row.vat_included)},
                ${boolean(row.money_transfer)}
            )`);
        }
    }

    // console.dir(await db.query("fatih", "SELECT * FROM transactions"));
    // console.dir(await db.query("ibrahim", "SELECT * FROM transactions"));
}

function nullableString(value) {
    if (value == "") return "null";
    else return "'" + value + "'";
}

function boolean(value) {
    return {
        "": "null",
        "f": "FALSE",
        "t": "TRUE"
    }[value];
}

function importCsv(filename) {
    return new Promise((resolve, reject) => {
        const csv = require('csv-parser');
        const fs = require('fs');

        const results = [];
        fs.createReadStream(filename)
            .pipe(csv(["id", "date", "amount", "description", "settled", "deductiontype", "vat_included", "money_transfer"]))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            });
    });
}

async function exec(command) {
    console.log(command);
    for (const user of ["fatih", "ibrahim"]) {
        console.log(user);
        console.log(await db.exec(user, command));
    }
}

init();