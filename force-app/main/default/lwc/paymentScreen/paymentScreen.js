import { LightningElement, track, api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import ORDER_OBJECT from '@salesforce/schema/Order_Product__c';
import NAME_FIELD from '@salesforce/schema/Order_Product__c.Buy_Product__c';
import FIRST_NAME_FIELD from '@salesforce/schema/Order_Product__c.First_Name__c';
import LAST_NAME_FIELD from '@salesforce/schema/Order_Product__c.Last_Name__c';
import EMAIL_FIELD from '@salesforce/schema/Order_Product__c.Email__c';
import ADDRESS_FIELD from '@salesforce/schema/Order_Product__c.Address__c';
import CITY_FIELD from '@salesforce/schema/Order_Product__c.City__c';
import STATE_FIELD from '@salesforce/schema/Order_Product__c.State__c';
import ZIP_FIELD from '@salesforce/schema/Order_Product__c.Zip__c';
import COUNTRY_FIELD from '@salesforce/schema/Order_Product__c.Country__c';
import QUANTITY_FIELD from '@salesforce/schema/Order_Product__c.Quantity__c';

export default class PaymentScreen extends LightningElement {
    @api amount;      // unit price
    @api name;        // product name
    @api productId;   // product record Id to set Buy_Product__c lookup

    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zip = '';
    @track country = '';
    @track quantity = 1;

    get totalAmount() {
        const qty = Number(this.quantity) || 0;
        const price = Number(this.amount) || 0;
        return qty * price;
    }

    get isPayDisabled() {
        return !this.totalAmount || !this.firstName || !this.lastName || !this.email;
    }

    handleChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    handleOrder() {
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.productId;  // set lookup
        fields[FIRST_NAME_FIELD.fieldApiName] = this.firstName;
        fields[LAST_NAME_FIELD.fieldApiName] = this.lastName;
        fields[EMAIL_FIELD.fieldApiName] = this.email;
        fields[ADDRESS_FIELD.fieldApiName] = this.address;
        fields[CITY_FIELD.fieldApiName] = this.city;
        fields[STATE_FIELD.fieldApiName] = this.state;
        fields[ZIP_FIELD.fieldApiName] = this.zip;
        fields[COUNTRY_FIELD.fieldApiName] = this.country;
        fields[QUANTITY_FIELD.fieldApiName] = this.quantity;
        // fields[TOTAL_AMOUNT_FIELD.fieldApiName] = this.totalAmount; // set read-only field here

        const recordInput = { apiName: ORDER_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(record => {
                console.log('Order created successfully:', record.id);
                this.dispatchEvent(new CustomEvent('close', { detail: record.id }));
            })
            .catch(error => {
                console.error('Error creating order:', JSON.stringify(error));
            });
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
