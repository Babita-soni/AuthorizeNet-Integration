public with sharing class ProductController {

//-------------------------------------- Get Products from the Buy_Product__c object ---------------------------------->
    @AuraEnabled(cacheable=true)
    public static List<Buy_Product__c> getProducts() {
        return [
            SELECT Id, Name, Amount__c, Product_Image__c
            FROM Buy_Product__c
            LIMIT 50
        ];
    }
}
