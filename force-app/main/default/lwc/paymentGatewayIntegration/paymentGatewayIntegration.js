import { LightningElement, track, api, wire } from 'lwc';
import myResource from "@salesforce/resourceUrl/AuthorizeCard";
import payByAuthrizePayment from "@salesforce/apex/PaymentGatewayIntegrationController.payByAuthrizePayment";
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import TOTAL_AMOUNT_FIELD from '@salesforce/schema/Order_Product__c.Total_Amount__c';
import QUANTITY_FIELD from '@salesforce/schema/Order_Product__c.Quantity__c';
 
export default class PaymentGatewayIntegration extends LightningElement {

    @api recordId;
    @track isPaid = false;
    @api amount = 0;
    @api productName = '';
    @api quantity = 0;

    authorizeurl = myResource; // Header image
    showCard = true;
    showSpinner = false;
    showPlaceOrder = true;

    // Credit Card Fields
    cardNumber = '';
    cvv = '';
    cardMonth = '';
    cardYear = '';


    @wire(getRecord, { recordId: '$recordId', fields: [TOTAL_AMOUNT_FIELD, QUANTITY_FIELD] })
    wiredRecord({ error, data }) {
        if (data) {
            this.amount = data.fields.Total_Amount__c.value;
            this.quantity = parseInt(data.fields.Quantity__c.value, 10);
        } else if (error) {
            this.ShowToast('Error!!', 'Failed to fetch Amount', 'error', 'dismissable');
        }
    }

    connectedCallback() {
        // If recordId is null/empty, use cart values
        if(!this.recordId) {
            this.amount = this.amount;
            this.quantity = this.quantity;
            this.productName = 'Cart Items';
        }
    }

    // Validation flags
    validCardNumber = false;
    validMonth = false;
    validYear = false;
    validCvv = false;

    monthOptions = [
        { value: "01", label: "January" },
        { value: "02", label: "February" },
        { value: "03", label: "March" },
        { value: "04", label: "April" },
        { value: "05", label: "May" },
        { value: "06", label: "June" },
        { value: "07", label: "July" },
        { value: "08", label: "August" },
        { value: "09", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" }
    ];

    yearOptions = [];

    constructor() {
        super();
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i < currentYear + 10; i++) {
            this.yearOptions.push({ label: '' + i, value: '' + i });
        }
    }

    handleChange(event) {
        const value = event.detail.value;
        const name = event.target.name;
        const inputField = this.template.querySelector(`.${name}`);

        switch(name) {
            case 'cardNumber':
                this.cardNumber = value;
                this.validCardNumber = inputField.reportValidity(); // checks if the field meets HTML validation rules
                break;
            case 'month':
                this.cardMonth = value;
                this.validMonth = inputField.reportValidity();
                break;
            case 'year':
                this.cardYear = value;
                this.validYear = inputField.reportValidity();
                break;
            case 'cvv':
                this.cvv = value;
                this.validCvv = inputField.reportValidity();
                break;
        }

        this.enableSave();
    }

    enableSave() {
        this.showPlaceOrder = !(this.validCardNumber && this.validMonth && this.validYear && this.validCvv);
    }

    handlePayment() {
        if (!(this.cardNumber.length === 16 && this.cvv.length === 3 && this.cardMonth && this.cardYear)) {
            this.ShowToast('Error!!', 'Please enter correct information', 'error', 'dismissable');
            return;
        }

        this.handleSpinner();

        payByAuthrizePayment({
            recordId: this.recordId,
            cardNumber: this.cardNumber,
            amount: this.amount,
            cardMonth: this.cardMonth,
            cardYear: this.cardYear,
            cvv: this.cvv,
            productName: this.productName,
            quantity: this.quantity
        })
        .then(res => {
            this.ShowToast('Success!', res, 'success', 'dismissable');
            this.isPaid = true;
            this.dispatchEvent(new CloseActionScreenEvent());
            this.dispatchEvent(new CustomEvent('paymentsuccess'));

        })
        .catch(err => {
            this.ShowToast('Error!!', err.body.message, 'error', 'dismissable');
        })
        .finally(() => {
            this.handleSpinner();
        });
    }

    handleSpinner() {
        this.showSpinner = !this.showSpinner;
    }

    ShowToast(title, message, variant, mode) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant, mode }));
    }
}
