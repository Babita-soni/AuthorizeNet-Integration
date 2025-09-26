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
    public static String payByAuthrizePayment(Id recordId, String cardNumber, String amount, String cardMonth, String cardYear, String cvv){
    String loginId = '6BdG46xer';
    String transactionKey = '9U2sY839q7f8gGGA';

    Order_product__c transRec = [
        SELECT Name, Total_Amount__c, First_Name__c, Last_Name__c,
               Email__c, Address__c, Buy_Product__c, Quantity__c,
               City__c, State__c, Country__c, Zip__c, Payment_Status__c
        FROM Order_Product__c
        WHERE Id = :recordId
        LIMIT 1
    ];

    Decimal unitPrice = transRec.Total_Amount__c/transRec.Quantity__c;
    
    if(String.isBlank(cardNumber) || String.isBlank(cardMonth) || String.isBlank(cardYear) || String.isBlank(cvv) || String.isBlank(amount)){
        throw newMessageException('Missing required payment information.');
    }

    
    String body = '{' +
'  "createTransactionRequest": {' +
'    "merchantAuthentication": {' +
'      "name": "'+loginId+'",' +
'      "transactionKey": "'+transactionKey+'"' +
'    },' +
'    "refId": "123456",' +
'    "transactionRequest": {' +
'      "transactionType": "authCaptureTransaction",' +
'      "amount": "'+amount+'",' +
'      "payment": {' +
'        "creditCard": {' +
'          "cardNumber": "'+cardNumber+'",' +
'          "expirationDate": "'+cardYear+'-'+cardMonth+'",' +
'          "cardCode": "'+cvv+'"' +
'        }' +
'      },' +
'      "lineItems": {' +
'        "lineItem": {' +
'          "itemId": "'+transRec.Name+'",' +
'          "name": "'+transRec.Buy_Product__c+'",' +
'          "description": "A Genuine Product",' +
'          "quantity": "'+transRec.Quantity__c+'",' +
'          "unitPrice": "'+unitPrice+'"' +
'        }' +
'      },' +
'      "tax": {' +
'        "amount": "4.26",' +
'        "name": "level2 tax name",' +
'        "description": "level2 tax"' +
'      },' +
'      "duty": {' +
'        "amount": "8.55",' +
'        "name": "duty name",' +
'        "description": "duty description"' +
'      },' +
'      "shipping": {' +
'        "amount": "4.26",' +
'        "name": "level2 tax name",' +
'        "description": "level2 tax"' +
'      },' +
'      "poNumber": "456654",' +
'      "customer": {' +
'        "id": "99999456654"' +
'      },' +
'      "billTo": {' +
'        "firstName": "'+transRec.First_Name__c+'",' +
'        "lastName": "'+transRec.Last_Name__c+'",' +
'        "company": "Metadologie",' +
'        "address": "'+transRec.Address__c+'",' +
'        "city": "'+transRec.City__c+'",' +
'        "state": "'+transRec.State__c+'",' +
'        "zip": "'+transRec.Zip__c+'",' +
'        "country": "'+transRec.Country__c+'"' +
'      },' +
'      "shipTo": {' +
'        "firstName": "'+transRec.First_Name__c+'",' +
'        "lastName": "'+transRec.Last_Name__c+'",' +
'        "company": "Metadologie",' +
'        "address": "'+transRec.Address__c+'",' +
'        "city": "'+transRec.City__c+'",' +
'        "state": "'+transRec.State__c+'",' +
'        "zip": "'+transRec.Zip__c+'",' +
'        "country": "'+transRec.Country__c+'"' +
'      },' +
'      "customerIP": "192.168.1.1",' +
'      "transactionSettings": {' +
'        "setting": {' +
'          "settingName": "testRequest",' +
'          "settingValue": "false"' +
'        }' +
'      },' +
'      "userFields": {' +
'        "userField": [' +
'          {' +
'            "name": "MerchantDefinedFieldName1",' +
'            "value": "MerchantDefinedFieldValue1"' +
'          },' +
'          {' +
'            "name": "favorite_color",' +
'            "value": "blue"' +
'          }' +
'        ]' +
'      },' +
'      "processingOptions": {' +
'        "isSubsequentAuth": "true"' +
'      },' +
'      "subsequentAuthInformation": {' +
'        "originalNetworkTransId": "123456789NNNH",' +
'        "originalAuthAmount": "45.00",' +
'        "reason": "resubmission"' +
'      },' +
'      "authorizationIndicatorType": {' +
'        "authorizationIndicator": "final"' +
'      }' +
'    }' +
'  }' +
'}';



    HttpRequest req = new HttpRequest();
    req.setEndpoint('https://apitest.authorize.net/xml/v1/request.api');
    req.setHeader('Content-Type', 'application/json');
    req.setMethod('POST');
    req.setBody(body);

    HttpResponse res = new Http().send(req);
    String responseBody = res.getBody();

    if(String.isBlank(responseBody)){
        throw newMessageException('Error encountered. Status Code: ' + res.getStatus());   
    }

    // Extract values directly from JSON string
    String transId = responseBody.contains('"transId":"') ? responseBody.substringBetween('"transId":"','"') : null;
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

    System.debug(messageDescription);
    System.debug(transId);
    System.debug(amount);
    System.debug(cardNumber);
    System.debug(cvv);

    if(responseBody.contains('"description":"This transaction has been approved."') || responseBody.contains('"description":"Your order has been received. Thank you for your business!"')){
        t.Status__c = 'Successful';
        t.Error_Message__c = 'N/A';
        try {
            insert t;
            transRec.Payment_Status__c = 'Completed';
            update transRec;
        } catch(DmlException de){
            System.debug('Transaction insert failed: ' + de.getMessage());
            throw newMessageException('Transaction record could not be created: ' + de.getMessage());
        }
        return 'This transaction has been approved.';
    } else {  
        String error = responseBody.contains('"text":"') ? responseBody.substringBetween('"text":"','"') : 'Unknown error';
        t.Status__c = 'Unsuccessful';
        t.Error_Message__c = error;
        try {
            insert t;
        } catch(DmlException de){
            System.debug('Transaction insert failed: ' + de.getMessage());
        }
        System.debug('Authorize.Net Error: ' + error);
        throw newMessageException('Error encountered: ' + error);
    }
}

 
    private static AuraHandledException newMessageException(String message) {
        AuraHandledException e = new AuraHandledException(message);
        e.setMessage(message);
        return e;
    }
}