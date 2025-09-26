import { LightningElement, api, track } from 'lwc';
import getOrderRecord from '@salesforce/apex/OrderProductController.getOrderRecord';

export default class OrderRecordPage extends LightningElement {
    @api recordId;
    @track order;
    loading = true;

    connectedCallback() {
        this.loadOrder();
    }

    loadOrder() {
        if (this.recordId) {
            this.loading = true;
            getOrderRecord({ orderId: this.recordId })
                .then(result => {
                    this.order = result;
                    this.loading = false;
                })
                .catch(error => {
                    console.error('Error loading order:', error);
                    this.loading = false;
                });
        }
    }
}
