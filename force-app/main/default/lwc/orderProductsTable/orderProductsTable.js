import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOrderProducts from '@salesforce/apex/OrderProductController.getOrderProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OrderProductsTable extends NavigationMixin(LightningElement) {
    
    @track orderProducts = [];
    wiredResult;


    @wire(getOrderProducts)
    wiredProducts(result) {
        this.wiredResult = result;
        const { data, error } = result;
        if (data) {
            this.orderProducts = data.map(op => {
                const amt = op.Total_Amount__c;
                const totalAmount = (amt !== undefined && amt !== null && !isNaN(amt))
                    ? `$${Number(amt).toFixed(2)}`
                    : '';
                return {
                    id: op.Id,                       // Order_Product__c record Id
                    orderId: op.Name,                // visible label
                    productName: op.Buy_Product__r.Name,
                    quantity: op.Quantity__c,
                    totalAmount,
                    status: op.Payment_Status__c,
                    statusClass: this.getStatusClass(op.Payment_Status__c)
                };
            });
        } else if (error) {
            this.orderProducts = [];
            console.error('Error loading order products', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Unable to load order products',
                variant: 'error'
            }));
        }
    }


// Click Order Id -> open the record page
    handleRowClick(event) {
        event.preventDefault();
        const recordId = event.currentTarget.dataset.id;
        if (!recordId) {
            console.warn('No record id found on clicked element');
            return;
        }

        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recordId,
                    objectApiName: 'Order_Product__c',
                    actionName: 'view'
                }
            });
        } catch (err) {
            window.location.href = `/lightning/r/Order_Product__c/${recordId}/view`;
        }
    }

    
//  SLDS classes + fallback classes
    getStatusClass(status) {
        if (!status) return 'slds-badge fallback-badge-warning';
        const s = String(status).toLowerCase();
        if (s === 'completed') {
            return 'slds-badge slds-theme_success fallback-badge-success';
        } else if (s === 'cancelled') {
            return 'slds-badge slds-theme_error fallback-badge-error';
        } else {
            return 'slds-badge slds-theme_warning fallback-badge-warning';
        }
    }
}