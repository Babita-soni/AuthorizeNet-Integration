import { LightningElement, track, api } from 'lwc';
import myResource from "@salesforce/resourceUrl/AuthorizeCard";
import payByAuthrizePayment from "@salesforce/apex/PaymentGatewayIntegrationController.payByAuthrizePayment";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
 
export default class PaymentGatewayIntegration extends LightningElement {
    @api recordId;
    @track isPaid = false;

    authorizeurl = myResource; // Header image
    showCard = true;
    showSpinner = false;
    showPlaceOrder = true;

    // Credit Card Fields
    cardNumber = '';
    cvv = '';
    cardMonth = '';
    cardYear = '';
    amount = '';

    // Validation flags
    validCardNumber = false;
    validAmount = false;
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
                this.validCardNumber = inputField.reportValidity();
                break;
            case 'amount':
                this.amount = value;
                this.validAmount = inputField.reportValidity();
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
        this.showPlaceOrder = !(this.validCardNumber && this.validAmount && this.validMonth && this.validYear && this.validCvv);
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
            cvv: this.cvv
        })
        .then(res => {
            this.ShowToast('Success!', res, 'success', 'dismissable');
            this.isPaid = true;
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
