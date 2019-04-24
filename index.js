const express = require("express");
const db = require("./db");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.listen(process.env.PORT || 80);

db.createTable();

app.get("/tx", async function (req, res) {
    const result = await db.selectAll();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/tx", async function (req, res) {
    const result = await db.insertTx(req.body.date, req.body.amount, req.body.description);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.post("/tx/settle", async function (req, res) {
    const result = await db.settleTx(req.body.id, req.body.settled || null);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.put("/tx", async function (req, res) {
    const result = await db.updateTx(req.body.id, req.body.date, req.body.amount, req.body.description);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});

app.delete("/tx", async function (req, res) {
    const result = await db.deleteTx(req.body.id);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
});