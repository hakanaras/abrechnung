const express = require("express");
const db = require("./db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.listen(process.env.PORT || 80);

app.post("/:user/sql", async function (req, res) {
    const result = await db.sql(req.params.user, req.body.command);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.get("/:user/tx", async function (req, res) {
    const result = await db.selectAll(req.params.user);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/:user/tx", async function (req, res) {
    const result = await db.insertTx(req.params.user, req.body.date, req.body.amount, req.body.description);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/:user/tx_regulars", async function (req, res) {
    const result = await db.insertTxRegulars(req.params.user, req.body.date);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/:user/tx/vat_included", async function (req, res) {
    const result = await db.setVatIncluded(req.params.user, req.body.id, req.body.vat_included);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/:user/tx/money_transfer", async function (req, res) {
    const result = await db.setMoneyTransfer(req.params.user, req.body.id, req.body.money_transfer);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/:user/tx/settle", async function (req, res) {
    const result = await db.settleTx(req.params.user, req.body.id, req.body.settled || null);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.put("/:user/tx", async function (req, res) {
    const result = await db.updateTx(req.params.user, req.body.id, req.body.date, req.body.amount, req.body.description);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.delete("/:user/tx", async function (req, res) {
    const result = await db.deleteTx(req.params.user, req.body.id);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});