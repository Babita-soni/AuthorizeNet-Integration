public with sharing class OrderProductController {

//------------------------Method to fetch the records from the Order_Product__c object ---------------------------------->
    @AuraEnabled(cacheable=true)
    public static List<Order_Product__c> getOrderProducts() {
        return [
            SELECT Id, Name, Buy_Product__c, Quantity__c, Total_Amount__c, Payment_Status__c, 
                    Buy_Product__r.Name, Buy_Product__r.Amount__c
            FROM Order_Product__c
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }


//------------------------- Method to fetch a particular record from the Order_Product__c object ------------------------>
    @AuraEnabled(cacheable=true)
    public static Order_Product__c getOrderRecord(Id orderId) {
        return [
            SELECT Id, Name, Buy_Product__c, Quantity__c, Total_Amount__c, Payment_Status__c,
                   First_Name__c, Last_Name__c, Email__c,
                   Address__c, City__c, State__c, Zip__c, Country__c
            FROM Order_Product__c
            WHERE Id = :orderId
            LIMIT 1
        ];
    }
}
