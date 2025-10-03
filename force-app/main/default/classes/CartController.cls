public with sharing class CartController {
    

//---------------------------Method to Add Products to the Product_Cart__c----------------------------------->
    @AuraEnabled //This makes the method accessible to LWC.
    public static void addToCart(String productName, Integer quantity, Decimal unitPrice) {
        try {
            Product_Cart__c existingCart = [
                SELECT Id, Quantity__c
                FROM Product_Cart__c
                WHERE Product_Name__c = :productName
                LIMIT 1
            ];

            if (existingCart != null) {
                // Update existing record
                existingCart.Quantity__c += quantity;
                update existingCart;
            }
        } catch (QueryException e) { //If no records are found, Salesforce throws a QueryException
            // insert a new one
            Product_Cart__c cart = new Product_Cart__c(
                Product_Name__c = productName,
                Quantity__c = quantity,
                Unit_Price__c = unitPrice
            );
            insert cart;
        } catch (Exception ex) {
            throw new AuraHandledException('Error adding/updating cart: ' + ex.getMessage());
        }
    }


//-------------On Increment or Decrement Quantity from Cart tab [-] 1 [+], update the Product_Cart__c also --------------------->
    @AuraEnabled
    public static void updateCartItemQuantity(Id cartItemId, Integer quantity) {
        Product_Cart__c cartItem = [SELECT Id, Quantity__c FROM Product_Cart__c WHERE Id = :cartItemId LIMIT 1];
        cartItem.Quantity__c = quantity;
        update cartItem;
    }


//-------------------On Successful Payment from the Payment Gateway, clear the Product_Cart__c -------------------->
    @AuraEnabled
    public static void clearCart() {
        Id userId = UserInfo.getUserId(); //returns the Id of the currently logged-in user
        List<Product_Cart__c> cartItems = [
            SELECT Id FROM Product_Cart__c WHERE CreatedById = :userId
        ];

        if (!cartItems.isEmpty()) {
            delete cartItems;
        }
    }

//-----------------------------Method to delete a Product from the Product_Cart__c -------------------------------->
    @AuraEnabled
    public static void deleteCartItem(Id cartItemId) {
        try {
            delete [SELECT Id FROM Product_Cart__c WHERE Id = :cartItemId LIMIT 1];
        } catch (DmlException e) {
            throw new AuraHandledException('Error deleting cart item: ' + e.getMessage());
        }
    }

//---------------------------------------- to fetch the Product_Cart__c --------------------------------------------->
    @AuraEnabled(cacheable=true) //cacheable=true means the result can be cached on the client-side. Only allowed for read-only operations (no DML)
    public static List<Product_Cart__c> getCartItems() {
        return [
            SELECT Id, Product_Name__c, Quantity__c, Unit_Price__c, Total__c
            FROM Product_Cart__c
            ORDER BY CreatedDate DESC
        ];
    }

}
