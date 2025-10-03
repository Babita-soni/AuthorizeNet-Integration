/*===================================================================================================================== =====
Class   :   PaymentGatewayIntegrationController
Description :   controller class for PaymentGatewayIntegration
Date    :   19/9/2025 - 23/09/2025
Developer   :   Babita Soni
=============================================================================================================================*/


/*for test in anonymous window
    String response = PaymentGatewayIntegrationController.payByAuthrizePayment(null, '5424000000000015','50','12','2024','999');
    System.debug('res>>'+response);*/


public with sharing class PaymentGatewayIntegrationController {

    @AuraEnabled
    public static String payByAuthrizePayment(Id recordId, String cardNumber, String amount, String cardMonth, String cardYear, String cvv, String productName, Integer quantity){
        // Validate input
        if(String.isBlank(cardNumber) || String.isBlank(cardMonth) || String.isBlank(cardYear) || String.isBlank(cvv) || String.isBlank(amount)){
            throw newMessageException('Missing required payment information.');
        }

        // Fetch current logged-in user's details
        User currentUser = [
            SELECT Name, Email, Address, Country
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];


        // Fetch Product Name if Record Id is not null
        if(productName != 'Cart Items' || recordId != null){
            Order_product__c transRec = [
                SELECT Buy_Product__r.Name
                FROM Order_Product__c
                WHERE Id = :recordId
                LIMIT 1
            ];
            productName = transRec.Buy_Product__r.Name;
        }

        Decimal unitPrice = Decimal.valueOf(amount) / quantity;

        String loginId = '6BdG46xer';
        String transactionKey = '9U2sY839q7f8gGGA';

        // Prepare Authorize.Net request body using only current user info
        String body = '{' +
            '"createTransactionRequest": {' +
                '"merchantAuthentication": {' +
                    '"name": "'+loginId+'",' +
                    '"transactionKey": "'+transactionKey+'"' +
                '},' +
                '"refId": "123456",' +
                '"transactionRequest": {' +
                    '"transactionType": "authCaptureTransaction",' +
                    '"amount": "'+amount+'",' +
                    '"payment": {' +
                        '"creditCard": {' +
                            '"cardNumber": "'+cardNumber+'",' +
                            '"expirationDate": "'+cardYear+'-'+cardMonth+'",' +
                            '"cardCode": "'+cvv+'"' +
                        '}' +
                    '},' +
                    '"lineItems": {' +
                        '"lineItem": {' +
                            '"itemId": "1",' +
                            '"name": "'+productName+'",' +
                            '"description": "A Genuine Product",' +
                            '"quantity": "'+quantity+'",' +
                            '"unitPrice": "'+unitPrice+'"' +
                        '}' +
                    '},' +
                    '"billTo": {' +
                        '"firstName": "'+currentUser.Name.split(' ')[0]+'",' + //.split(' ') → splits the string into an array by spaces - "John Doe".split(' ') -> ["John", "Doe"]
                        '"lastName": "'+(currentUser.Name.split(' ').size() > 1 ? currentUser.Name.split(' ')[1] : '')+'",' +
                        '"company": "Metadologie",' +
                        '"address": "N/A",' +
                        '"city": "",' +
                        '"state": "",' +
                        '"zip": "",' +
                        '"country": "'+currentUser.Country+'"' +
                    '},' +
                    '"shipTo": {' +
                        '"firstName": "'+currentUser.Name.split(' ')[0]+'",' +
                        '"lastName": "'+(currentUser.Name.split(' ').size() > 1 ? currentUser.Name.split(' ')[1] : '')+'",' +
                        '"company": "Metadologie",' +
                        '"address": "N/A",' +
                        '"city": "",' +
                        '"state": "",' +
                        '"zip": "",' +
                        '"country": "'+currentUser.Country+'"' +
                    '},' +
                    '"customerIP": "192.168.1.1"' +
                '}' +
            '}' +
        '}';

        // Send HTTP request to Authorize.Net
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://apitest.authorize.net/xml/v1/request.api');
        req.setHeader('Content-Type', 'application/json');
        req.setMethod('POST');
        req.setBody(body);

        HttpResponse res = new Http().send(req); // Store the response
        String responseBody = res.getBody(); // From JSON response to String

        if(String.isBlank(responseBody)){
            throw newMessageException('Error encountered. Status Code: ' + res.getStatus());   
        }

        // Extract transaction details from JSON response
        String transId = responseBody.contains('"transId":"') ? responseBody.substringBetween('"transId":"','"') : null; // substringBetween(start, end) is an Apex String method
        String messageDescription = responseBody.contains('"description":"') ? responseBody.substringBetween('"description":"','"') : null;
        String cardType = responseBody.contains('"accountType":"') ? responseBody.substringBetween('"accountType":"','"') : null;

        // Prepare Transaction record
        Transaction__c t = new Transaction__c();
        t.Name = 'Ref-' + Datetime.now().getTime();
        t.Date__c = Date.today();
        t.Transaction_ID__c = transId;
        t.Amount__c = Decimal.valueOf(amount);
        t.Credit_Card_Number__c = 'XXXXXXXXXXXX' + cardNumber.right(4);
        t.Response__c = messageDescription;
        t.Type__c = cardType;

        if(responseBody.contains('"description":"This transaction has been approved."') || responseBody.contains('"description":"Your order has been received. Thank you for your business!"')){
            t.Status__c = 'Successful';
            t.Error_Message__c = 'N/A';
            try {
                insert t;
                // Update Payment_Status__c on the Order_Product__c record
                if(recordId != null) {
                    Order_Product__c orderRec = [SELECT Id, Payment_Status__c FROM Order_Product__c WHERE Id = :recordId LIMIT 1];
                    orderRec.Payment_Status__c = 'Completed';
                    update orderRec;
                }
            } catch(DmlException de){
                System.debug('Transaction insert failed: ' + de.getMessage());
                throw newMessageException('Transaction record could not be created: ' + de.getMessage());
            }
            return 'This transaction has been approved.';
        } else {  
            String error = responseBody.contains('"text":"') ? responseBody.substringBetween('"text":"','"') : 'Unknown error';
            t.Status__c = 'Unsuccessful';
            t.Error_Message__c = error;
            try { insert t; } catch(DmlException de){ System.debug('Transaction insert failed: ' + de.getMessage()); }
            System.debug('Authorize.Net Error: ' + error);
            throw newMessageException('Error encountered: ' + error);
        }
    }

    private static AuraHandledException newMessageException(String message) {
        AuraHandledException e = new AuraHandledException(message);
        e.setMessage(message);
        return e;
    } //AuraHandledException is a special Apex exception that: Can be safely sent to LWC or Aura components. The message will appear in the UI if thrown.
}
