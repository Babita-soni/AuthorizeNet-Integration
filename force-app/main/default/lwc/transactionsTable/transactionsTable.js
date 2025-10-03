// transactionsTable.js
import { LightningElement, track, wire } from 'lwc';
import getTransactions from '@salesforce/apex/TransactionController.getTransactions';

export default class TransactionsTable extends LightningElement {
    @track transactions = [];

    @wire(getTransactions)
    wiredTransactions({ error, data }) {
        if (data) {
            // Map Salesforce records to the table format
            this.transactions = data.map(trx => ({
                id: trx.Id,
                Name: trx.Name, // Name field used as reference
                type: trx.Type__c,
                card: trx.Credit_Card_Number__c,
                amount: `₹${trx.Amount__c}`,
                status: trx.Status__c,
                date: trx.Date__c ? new Date(trx.Date__c).toLocaleDateString() : ''
            }));
        } else if (error) {
            console.error('Error fetching transactions:', error);
        }
    }
}
