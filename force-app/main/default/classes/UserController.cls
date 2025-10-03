public with sharing class UserController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getCurrentUserCartTotal() {
        Id currentUserId = UserInfo.getUserId(); // returns the Id of the currently logged-in user
        User u = [SELECT Name, Email FROM User WHERE Id = :currentUserId LIMIT 1];

        Decimal totalAmount = 0;
        for(Product_Cart__c c : [SELECT Quantity__c, Unit_Price__c FROM Product_Cart__c WHERE CreatedById = :currentUserId]) {
            totalAmount += (c.Quantity__c * c.Unit_Price__c);
        }

        return new Map<String,Object>{
            'Name' => u.Name,
            'Email' => u.Email,
            'TotalAmount' => totalAmount
        };
    }
}
