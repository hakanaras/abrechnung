const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

client.connect();

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
    const regulars = JSON.parse(`[
        {
           "id":1078,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-30835.00",
           "description":"Material SHT",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1080,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-5877.00",
           "description":"Material W+S",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":true
        },
        {
           "id":1081,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-2570.00",
           "description":"Material Holter",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1082,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-329.00",
           "description":"Material Bauhaus",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1083,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-1157.00",
           "description":"Won Fatih",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":false
        },
        {
           "id":1084,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-1060.00",
           "description":"Won Saniye",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":false
        },
        {
           "id":1087,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-1476.00",
           "description":"Lohn Burak",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":true
        },
        {
           "id":1088,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-500.00",
           "description":"Lost Burak",
           "settled":null,
           "deductiontype":"none",
           "vat_included":false,
           "money_transfer":true
        },
        {
           "id":1089,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-499.00",
           "description":"Finanzamt",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":true
        },
        {
           "id":1090,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-2636.00",
           "description":"WGKK",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":true
        },
        {
           "id":1091,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-241.00",
           "description":"MA6",
           "settled":null,
           "deductiontype":null,
           "vat_included":false,
           "money_transfer":true
        },
        {
           "id":1092,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-116.00",
           "description":"Bankkonto",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1093,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-436.00",
           "description":"Versicherungen",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1094,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-290.00",
           "description":"Auto Tank",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1095,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-140.00",
           "description":"Gruber",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1098,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-359.00",
           "description":"Lager Miete",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1099,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-331.00",
           "description":"Material Amazon",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1100,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-68.00",
           "description":"Wien Energie",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1101,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-50.00",
           "description":"Handy/Internet",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1102,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-60.00",
           "description":"Auto Garage",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":true
        },
        {
           "id":1079,
           "date_":"2020-07-01T00:00:00.000Z",
           "amount":"-7896.00",
           "description":"Won Material SHT",
           "settled":null,
           "deductiontype":null,
           "vat_included":true,
           "money_transfer":false
        }
     ]`);
    for (const regular of regulars) {
        console.dir(regular);
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