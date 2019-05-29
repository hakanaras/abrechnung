Vue.mixin({
    methods: {
        currencyFormat: function (value) {
            if (typeof value == "string") {
                value = parseFloat(value);
            }
            return "€ " + value.toFixed(2);
        }
    }
});

Vue.component("tx-table-row", {
    methods: {
        onClickVatIncluded: function () {
            $.post("/tx/vat_included", { id: this.tx.id, vat_included: !this.tx.vat_included }, data => {
                this.$emit("new-tx-data", data);
            });
        },
        onClickDeductionType: function (type) {
            const command = "UPDATE transactions SET deductionType='" + type + "' WHERE id=" + this.tx.id;
            $.post("/sql", { command }, () => {
                $.get("/tx", data => {
                    this.$emit("new-tx-data", data);
                });
            });
        },
        onClickAdd: function () {
            if (!this.dateInput) {
                return window.alert("Ungültiges Datum!");
            }
            $.post("/tx", {
                date: this.dateInput,
                amount: this.amountInput,
                description: this.descInput
            }, data => {
                this.$emit("new-tx-data", data);
            });
            this.amountInput = 0;
            this.descInput = "";
        },
        onClickSave: function () {
            if (!this.dateInput) {
                return window.alert("Ungültiges Datum!");
            }
            $.ajax({
                url: "/tx", type: "PUT", data: {
                    id: this.tx.id,
                    date: this.dateInput,
                    amount: this.amountInput,
                    description: this.descInput
                }, success: data => {
                    this.$emit("new-tx-data", data);
                }
            });
            this.editing = false;
        },
        onClickDelete: function () {
            if (!window.confirm("'" + this.tx.description + "' löschen?")) {
                return;
            }
            $.ajax({ url: "/tx", type: "DELETE", data: { id: this.tx.id }, success: data => { this.$emit("new-tx-data", data); } });
        },
        onChng: function () {
            if (this.creator) {
                return;
            }
            this.editing = true;
        },
        onClickSettle: function () {
            $.post("/tx/settle", {
                id: this.tx.id,
                settled: this.settledInput
            }, data => {
                this.$emit("new-tx-data", data);
            });
        }
    },
    data: function () {
        return {
            dateInput: this.creator ? new Date().toISOString().substr(0, 10) : this.tx.date,
            amountInput: this.creator ? 0 : this.tx.amount,
            descInput: this.creator ? "" : this.tx.description,
            settledInput: (this.tx && this.tx.settled) ? this.tx.settled : new Date().toISOString().substr(0, 10),
            editing: false
        };
    },
    props: ["tx", "creator"],
    template: `
    <tr :class="{'bg-success': creator, 'bg-warning': editing}">
        <td class="text-nowrap">
            <input type="date" v-model="dateInput" class="table-cell-input" @change="onChng()" @keydown="onChng()">
        </td>
        <td class="text-nowrap text-right">
            <input type="number" step="0.01" v-model="amountInput" class="table-cell-input" :class="{'text-danger': amountInput < 0}" @change="onChng()" @keydown="onChng()">
        </td>
        <td class="text-nowrap">
            <input type="text" v-model="descInput" class="table-cell-input" @change="onChng()" @keydown="onChng()">
        </td>
        <td class="text-nowrap">
            <button v-if="creator" type="button" class="btn btn-success table-ctrl-btn" @click="onClickAdd">
                <i class="fas fa-plus"></i>
            </button>
            <button v-if="editing" type="button" class="btn btn-success table-ctrl-btn" @click="onClickSave">
                <i class="fas fa-save"></i>
            </button>
            <span v-if="!creator">
                <button type="button" class="btn btn-danger table-ctrl-btn" @click="onClickDelete">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button v-if="tx.amount > 0" type="button"
                    class="btn table-ctrl-btn" :class="{'btn-success': tx.settled, 'btn-warning': !tx.settled}"
                    data-toggle="modal" :data-target="'#settle-modal-' + tx.id" :title="tx.settled ? ('Beglichen am: ' + tx.settled) : 'Unbeglichen'">
                        <i class="fas fa-euro-sign"></i>
                </button>
                <div v-if="tx.amount > 0" :id="'settle-modal-' + tx.id" class="modal fade" role="dialog">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">{{ tx.description }}</h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <p>
                                    {{ tx.settled ? "Diese Rechnung wurde beglichen am: " + tx.settled : "Diese Rechnung ist noch unbeglichen." }}
                                </p>
                                <div class="input-group mb-3">
                                    <input type="date" class="form-control" v-model="settledInput">
                                    <div class="input-group-append" id="button-addon4">
                                        <button type="button"
                                        class="btn btn-sm" :class="{'btn-success': !tx.settled, 'btn-warning': tx.settled}"
                                        :disabled="settledInput == tx.settled" @click="onClickSettle()">
                                            {{ tx.settled ? "Ändern" : "Begleichen" }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn table-ctrl-btn"
                        :class="{'btn-success': tx.vat_included, 'btn-warning': !tx.vat_included}"
                        @click="onClickVatIncluded()"
                        :title="tx.vat_included ? 'Vorsteuer enthalten' : 'Keine Vorsteuer enthalten'">
                    <i class="fas fa-percentage"></i>
                </button>
                <button v-if="tx.deductiontype != 'none'" type="button" class="btn btn-success table-ctrl-btn" @click="onClickDeductionType('none')" title="Wird normal verrechnet (Rechnung vorhanden)">
                    <i class="fas fa-file-invoice-dollar"></i>
                </button>
                <button v-if="tx.deductiontype == 'none'" type="button" class="btn btn-warning table-ctrl-btn" @click="onClickDeductionType('normal')" title="Wird nicht verrechnet (Keine Rechnung)">
                    <i class="fas fa-comment-dollar"></i>
                </button>
            </span>
        </td>
    </tr>`
});

new Vue({
    el: '#vue-app',
    created: function () {
        $.get("/tx", data => {
            this.transactions = data;
        });
    },
    computed: {
        filteredTransactions: function () {
            function asNumber(value) {
                return typeof value == "string" ? parseFloat(value) : value;
            }
            const byDescription = this.transactions.filter(t => t.description.toLowerCase().indexOf(this.txSearchTerm.toLowerCase()) >= 0);
            const byDate = byDescription.filter(t => (!this.txFromDate || this.txFromDate <= t.date) && (!this.txToDate || this.txToDate >= t.date));
            byDate.expenseSum = byDate.reduce(((a, t) => asNumber(t.amount) < 0 ? a - asNumber(t.amount) : a), 0);
            byDate.incomeSum = byDate.reduce(((a, t) => asNumber(t.amount) > 0 ? a + asNumber(t.amount) : a), 0);
            byDate.sum = -byDate.reduce(((a, t) => a - asNumber(t.amount)), 0);
            return byDate;
        },
        annual: function () {
            function asNumber(value) {
                return typeof value == "string" ? parseFloat(value) : value;
            }

            function eSt(amount) {
                const brackets = [[11000, 0], [18000, 0.25], [31000, 0.35], [60000, 0.42], [90000, 0.48], [999999999, 0.5]];
                let last = 0;
                let sum = 0;
                for (const bracket of brackets) {
                    const bracketAmount = Math.min(bracket[0] - last, Math.max(0, amount - last));
                    sum += bracketAmount * bracket[1];
                    last = bracket[0];
                    console.log(bracketAmount + ":" + bracket[1] + ":" + sum);
                }
                return sum;
            }

            const uvBeitrag = 117.49;
            const pvMinGrundlage = 7851;
            const kvMinGrundlage = 5256.60;
            const maxGrundlage = 71820;

            const byDate = this.transactions
                .filter(t => this.annualYear + "-01-01" <= t.date && this.annualYear + "-12-31" >= t.date)
                .filter(t => t.deductiontype != "none");

            byDate.vatSum = byDate.reduce((a, t) => t.vat_included ? a + asNumber(t.amount) : a, 0);
            byDate.expenseSum = byDate.reduce(((a, t) => asNumber(t.amount) < 0 ? a - asNumber(t.amount) : a), 0);
            byDate.incomeSum = byDate.reduce(((a, t) => asNumber(t.amount) > 0 ? a + asNumber(t.amount) : a), 0);
            byDate.sum = -byDate.reduce(((a, t) => a - asNumber(t.amount)), 0);

            const pvBeitrag = Math.min(Math.max(byDate.sum, pvMinGrundlage), maxGrundlage) * 0.185;
            byDate.pvBeitrag = pvBeitrag;
            const kvBeitrag = Math.min(Math.max(byDate.sum, kvMinGrundlage), maxGrundlage) * 0.0765;
            byDate.kvBeitrag = this.annualYear < 2021 ? 402.12 : kvBeitrag;
            byDate.uvBeitrag = uvBeitrag;

            byDate.est = eSt(byDate.sum);

            return byDate;
        }
    },
    methods: {
        onNewTxData: function (data) {
            this.transactions = data;
        }
    },
    data: {
        activeView: "transactions",
        views: [{
            id: "transactions",
            label: "Buchungen"
        }, {
            id: "annual",
            label: "Gewinnversteuerung"
        }],

        txFromDate: "",
        txToDate: "",
        txSearchTerm: "",
        transactions: [],

        annualYear: 2019
    }
});