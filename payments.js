// Payments system for MozCommerce

class PaymentSystem {
    constructor() {
        this.transactions = [];
    }

    processPayment(amount, method) {
        const transaction = { amount, method, date: new Date() };
        this.transactions.push(transaction);
        return `Processed ${method} payment of ${amount}`;
    }

    getTransactions() {
        return this.transactions;
    }
}

module.exports = PaymentSystem;