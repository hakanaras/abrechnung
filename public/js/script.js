Vue.mixin({
    methods: {
        currencyFormat: function (value) {
            if (typeof value == "string") {
                value = parseFloat(value);
            }
            return "€ " + value.toFixed(2);
        },
        verifyData: function (date, amount) {

        }
    }
});

Vue.component("tx-table-row", {
    methods: {
        onClickAdd: function () {
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
            $.ajax({ url: "/tx", type: "DELETE", data: { id: this.tx.id }, success: data => { this.$emit("new-tx-data", data); } });
        },
        onChng: function () {
            if (this.creator == "true") {
                return;
            }
            this.editing = true;
        }
    },
    data: function () {
        return {
            dateInput: this.creator == "true" ? new Date().toISOString().substr(0, 10) : this.tx.date,
            amountInput: this.creator == "true" ? 0 : this.tx.amount,
            descInput: this.creator == "true" ? "" : this.tx.description,
            editing: false
        };
    },
    props: ["tx", "creator"],
    template: `
    <tr :class="{'bg-success': this.creator == 'true', 'bg-warning': this.editing}">
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
            <button v-if="!creator" type="button" class="btn btn-danger table-ctrl-btn" @click="onClickDelete">
                <i class="fas fa-trash-alt"></i>
            </button>
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
            const byDescription = this.transactions.filter(t => t.description.indexOf(this.txSearchTerm) >= 0);
            const byDate = byDescription.filter(t => this.txFromDate <= t.date && this.txToDate >= t.date);
            byDate.expenseSum = byDate.reduce(((a, t) => asNumber(t.amount) < 0 ? a - asNumber(t.amount) : a), 0);
            byDate.incomeSum = byDate.reduce(((a, t) => asNumber(t.amount) > 0 ? a + asNumber(t.amount) : a), 0);
            byDate.sum = -byDate.reduce(((a, t) => a - asNumber(t.amount)), 0);
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

        txFromDate: "2019-01-01",
        txToDate: "2099-01-01",
        txSearchTerm: "",
        transactions: []
    }
});