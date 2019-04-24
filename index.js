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

app.post("/tx", function (req, res) {
    const result = await db.insertTx(req.body.date, req.body.amount, req.body.description);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
});

app.post("/tx/settle", function (req, res) {
    return res.status(500);
    const entry = data.transactions.find(tx => tx.id == req.body.id);
    if (entry == null) {
        return res.status(404).end();
    }
    entry.settled = req.body.settled;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
    fs.writeFileSync("./data.json", JSON.stringify(data));
});

app.put("/tx", function (req, res) {
    return res.status(500);
    const entry = data.transactions.find(tx => tx.id == req.body.id);
    if (entry == null) {
        return res.status(404).end();
    }
    entry.date = req.body.date;
    entry.amount = req.body.amount;
    entry.description = req.body.description;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
    fs.writeFileSync("./data.json", JSON.stringify(data));
});

app.delete("/tx", function (req, res) {
    return res.status(500);
    const index = data.transactions.findIndex(element => element.id == req.body.id);
    data.transactions.splice(index, 1);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
    fs.writeFileSync("./data.json", JSON.stringify(data));
});