public with sharing class TransactionController {
    @AuraEnabled(cacheable=true)
    public static List<Transaction__c> getTransactions() {
        return [
            SELECT Id, name, Type__c, Credit_Card_Number__c, Amount__c, Status__c, Date__c
            FROM Transaction__c
            ORDER BY Date__c DESC
            LIMIT 50
        ];
    }
}
