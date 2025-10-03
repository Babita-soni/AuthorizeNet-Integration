import { LightningElement, wire, track } from 'lwc';
import getCartItems from '@salesforce/apex/CartController.getCartItems';
import productImages from '@salesforce/resourceUrl/ProductImages';
import updateCartItemQuantity from '@salesforce/apex/CartController.updateCartItemQuantity';
import clearCart from '@salesforce/apex/CartController.clearCart';
import deleteCartItem from '@salesforce/apex/CartController.deleteCartItem';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class ProductCartTab extends LightningElement {
    //@track - if the property’s value updates in JavaScript, the UI updates without manually refreshing.
    @track cartItems = [];
    @track totalQuantity = 0;
    @track totalAmount = 0;
    @track showCheckoutModal = false;

    /*@wire - It connects your component to Salesforce data.
    It automatically fetches data and updates your component when something changes*/
    @wire(getCartItems)
    wiredCart({ error, data }) {
        if (data) {
            this.cartItems = data.map(item => ({
                ...item,
                ImageUrl: `${productImages}/${item.Product_Name__c}.png`
            }));
            // Calculate totals
            this.calculateCartSummary();
        } else if (error) {
            console.error(error);
        }
    }


    calculateCartSummary() {
        this.totalQuantity = this.cartItems.reduce((sum, item) => sum + (item.Quantity__c || 0), 0);
        this.totalAmount = this.cartItems.reduce((sum, item) => sum + (item.Total__c || 0), 0);
    }



    handleCheckout() {
        //alert(`Proceeding to checkout. Total Amount: ₹${this.totalAmount}`);
        this.showCheckoutModal = true;
    }


    handleCloseModal() {
        this.showCheckoutModal = false;
    }


// handle Decrement button click
    handleDecrement(event) {
    const productId = event.target.dataset.id;
    this.cartItems = this.cartItems.map(item => {
        if (item.Id === productId && item.Quantity__c > 1) {
            item.Quantity__c -= 1;
            item.Total__c = item.Quantity__c * item.Unit_Price__c;
            updateCartItemQuantity({ cartItemId: item.Id, quantity: item.Quantity__c })
                .catch(err => console.error(err));
        }
        return item;
    });
    this.calculateCartSummary();
    }


// handle Increment button click
    handleIncrement(event) {
        const productId = event.target.dataset.id;
        this.cartItems = this.cartItems.map(item => {
            if (item.Id === productId) {
                item.Quantity__c += 1;
                updateCartItemQuantity({ cartItemId: item.Id, quantity: item.Quantity__c })
                    .catch(err => console.error(err));
            }
            return item;
        });
        this.calculateCartSummary();
    }

    
// Empty Card on Payment Successful
    handlePaymentSuccess() {
    this.showCheckoutModal = false;
    // Call ClearCart apex method
    clearCart()
        .then(() => {
            this.cartItems = [];
            this.totalQuantity = 0;
            this.totalAmount = 0;
        })
        .catch(err => console.error('Failed to clear cart:', err));
    }


// handle Delete button click
    handleDelete(event) {
    const itemId = event.target.dataset.id;
    this.cartItems = this.cartItems.filter(item => item.Id !== itemId); //creates a new array containing all items except the one being deleted.
    this.calculateCartSummary();
    // Call deleteCartItem apex method
    deleteCartItem({ cartItemId: itemId })
        .then(() => { 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Item removed from the cart.',
                    variant: 'success'
                })
            );
        })
        .catch(error => { 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Could not delete item: ' + error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}