import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/ProductController.getProducts';
import productImages from '@salesforce/resourceUrl/ProductImages';
import addToCart from '@salesforce/apex/CartController.addToCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class ProductsPage extends LightningElement {
    @track products = [];
    @track showPayment = false;
    @track selectedProductId;
    @track selectedAmount;
    @track selectedName;


    @wire(getProducts)
        wiredProducts({ error, data }) {
            if (data) {
                this.products = data.map(prod => {
                    const imageUrl = `${productImages}/${prod.Name}.png`;
                    return {
                        Id: prod.Id,
                        Name: prod.Name,
                        Amount: prod.Amount__c,
                        ImageUrl: imageUrl,
                        quantity: 1
                    };
                });
            } else if (error) {
                console.error(error);
            }
        }

    
    increaseQuantity(event) {
        const productId = event.target.dataset.id;
        this.products = this.products.map(p => {
            if (p.Id === productId) p.quantity += 1;
            return p;
        });
    }

    decreaseQuantity(event) {
        const productId = event.target.dataset.id;
        this.products = this.products.map(p => {
            if (p.Id === productId && p.quantity > 1) p.quantity -= 1;
            return p;
        });
    }

    handleAddToCart(event) {
    const productId = event.target.dataset.id;
    const product = this.products.find(p => p.Id === productId);

    addToCart({ productName: product.Name , quantity: product.quantity, unitPrice: product.Amount })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `${product.quantity} ${product.Name} added to cart!`,
                    variant: 'success'
                })
            );
            // Reset quantity to 1 for that product
            product.quantity = 1;
        })
        .catch(error => {
            console.error(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to add product to cart',
                    variant: 'error'
                })
            );
        });
    }

    handleOrder(event) {
        this.selectedProductId = event.target.dataset.id;
        this.showPayment = true;
        this.selectedAmount = event.target.dataset.amount;
        this.selectedName = event.target.dataset.name;
    }

    handleClosePayment() {
        this.showPayment = false;
        this.selectedProductId = null;
    }
}
