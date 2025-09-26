import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getHostedFormToken from '@salesforce/apex/AuthorizeNetService.getHostedFormToken';
import NAME_FIELD from '@salesforce/schema/Order_Product__c.Name';
import FIRST_NAME_FIELD from '@salesforce/schema/Order_Product__c.First_Name__c';
import LAST_NAME_FIELD from '@salesforce/schema/Order_Product__c.Last_Name__c';
import EMAIL_FIELD from '@salesforce/schema/Order_Product__c.Email__c';
import ADDRESS_FIELD from '@salesforce/schema/Order_Product__c.Address__c';
import CITY_FIELD from '@salesforce/schema/Order_Product__c.City__c';
import STATE_FIELD from '@salesforce/schema/Order_Product__c.State__c';
import ZIP_FIELD from '@salesforce/schema/Order_Product__c.Zip__c';
import COUNTRY_FIELD from '@salesforce/schema/Order_Product__c.Country__c';
import PRODUCT_NAME_FIELD from '@salesforce/schema/Order_Product__c.Buy_Product__c';
import QUANTITY_FIELD from '@salesforce/schema/Order_Product__c.Quantity__c';
import TOTAL_AMOUNT_FIELD from '@salesforce/schema/Order_Product__c.Total_Amount__c';
import PAYMENT_STATUS_FIELD from '@salesforce/schema/Order_Product__c.Payment_Status__c';


export default class PaymentScreen extends LightningElement {
    @api recordId; // Salesforce Order_Product record Id
    @track amount;  // Amount to be paid, fetch from record
    @track email;
    @track firstName;
    @track lastName;
    @track address;
    @track city;
    @track state;
    @track zip;
    @track country;

    fieldsToShow = [
        NAME_FIELD,
        PRODUCT_NAME_FIELD,
        QUANTITY_FIELD,
        TOTAL_AMOUNT_FIELD,
        PAYMENT_STATUS_FIELD
    ];

    // wire record data
    @wire(getRecord, { recordId: '$recordId', 
        fields: [NAME_FIELD, PRODUCT_NAME_FIELD, QUANTITY_FIELD, TOTAL_AMOUNT_FIELD, PAYMENT_STATUS_FIELD,
            FIRST_NAME_FIELD, LAST_NAME_FIELD, EMAIL_FIELD, ADDRESS_FIELD, CITY_FIELD, STATE_FIELD, ZIP_FIELD, COUNTRY_FIELD
        ]})
    orderProduct({ error, data }) {
        if (data) {
            this.amount = data.fields.Total_Amount__c.value;
            this.email = data.fields.Email__c.value;
            this.firstName = data.fields.First_Name__c.value;
            this.lastName = data.fields.Last_Name__c.value;
            this.address = data.fields.Address__c.value;
            this.city = data.fields.City__c.value;
            this.state = data.fields.State__c.value;
            this.zip = data.fields.Zip__c.value;
            this.country = data.fields.Country__c.value;

        } else if (error) {
            console.error('Error fetching record:', error);
        }
    }

    get isPayDisabled() {
    return !this.amount || !this.firstName || !this.lastName || !this.email;
}


    handlePayNow() { 
    getHostedFormToken({ 
        amount: this.amount, 
        sourceRecordId: this.recordId, 
        firstName: this.firstName, 
        lastName: this.lastName,
        email: this.email,
        address: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        country: this.country
    }) 
    .then(token => {
        this.openHostedForm(token); 
    }) 
    .catch(error => { 
        console.error('Error generating token:', error);
        alert('Error fetching payment token. Check debug logs.');
        console.error(JSON.stringify(error));
    });
}


    openHostedForm(token) {
        console.log('Token:', token);
        console.log('Amount to be paid: '+ this.amount);
        console.log('Email: '+ this.email);
        console.log('First Name: '+ this.firstName);
        console.log('Last Name: '+ this.lastName);
        console.log('Address: '+ this.address);
        console.log('City: '+ this.city);
        console.log('State: '+ this.state);
        console.log('Zip: '+ this.zip);
        console.log('Country: '+ this.country);

        const url = 'https://accept.authorize.net/payment/payment'; // Create a temporary form to POST to Authorize.Net 
        const form = document.createElement('form'); 
        form.setAttribute('method', 'POST'); 
        form.setAttribute('action', url); 
        form.setAttribute('target', '_blank'); // opens in new tab 
        const tokenInput = document.createElement('input'); 
        tokenInput.setAttribute('type', 'hidden'); 
        tokenInput.setAttribute('name', 'token'); 
        tokenInput.setAttribute('value', token); 
        form.appendChild(tokenInput); 
        document.body.appendChild(form); 
        form.submit(); 
        document.body.removeChild(form); 
    }
}