import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// Fields to fetch from Order_Product__c
const FIELDS = [
    'Order_Product__c.First_Name__c',
    'Order_Product__c.Last_Name__c',
    'Order_Product__c.Email__c',
    'Order_Product__c.Address__c',
    'Order_Product__c.City__c',
    'Order_Product__c.State__c',
    'Order_Product__c.Zip__c',
    'Order_Product__c.Country__c'
];

export default class PersonalInfoCard extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    get fullName() {
        return this.record?.data 
            ? `${this.record.data.fields.First_Name__c.value} ${this.record.data.fields.Last_Name__c.value}` 
            : '';
    }

    get email() {
        return this.record?.data ? this.record.data.fields.Email__c.value : '';
    }

    get address() {
        return this.record?.data ? this.record.data.fields.Address__c.value : '';
    }

    get zipCode() {
        return this.record?.data ? this.record.data.fields.Zip__c.value : '';
    }

    get city() {
        return this.record?.data ? this.record.data.fields.City__c.value : '';
    }

    get state() {
        return this.record?.data ? this.record.data.fields.State__c.value : '';
    }

    get country() {
        return this.record?.data ? this.record.data.fields.Country__c.value : '';
    }
}
