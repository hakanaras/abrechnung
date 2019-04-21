const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.listen(process.env.PORT || 80);

if (!fs.existsSync("./data.json")) {
    fs.writeFileSync("./data.json", "{\"idCounter\": 0, \"transactions\": []}");
}
const data = require("./data.json");

app.get("/tx", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
});

app.post("/tx", function (req, res) {
    data.transactions.push({
        id: data.idCounter++,
        date: req.body.date,
        amount: req.body.amount,
        description: req.body.description,
        settled: false
    });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
    fs.writeFileSync("./data.json", JSON.stringify(data));
});

app.post("/tx/settle", function (req, res) {
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
    const index = data.transactions.findIndex(element => element.id == req.body.id);
    data.transactions.splice(index, 1);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data.transactions));
    fs.writeFileSync("./data.json", JSON.stringify(data));
});