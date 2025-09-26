public with sharing class AuthorizeNetService {

    private static final String API_LOGIN_ID = '6BdG46xer';
    private static final String TRANSACTION_KEY = '9U2sY839q7f8gGGA';
    private static final String ENDPOINT = 'https://apitest.authorize.net/xml/v1/request.api';

    @AuraEnabled
    public static String getHostedFormToken(Decimal amount, Id sourceRecordId, String firstName, 
    String lastName, String address, String city, String state, String zip, String country, String email) {
        try {
            // JSON from Authorize.Net docs
            String requestBody = 
            '{' +
            '  "getHostedPaymentPageRequest": {' +
            '    "merchantAuthentication": {' +
            '      "name": "'+API_LOGIN_ID+'",' +
            '      "transactionKey": "'+TRANSACTION_KEY+'"' +
            '    },' +
            '    "transactionRequest": {' +
            '      "transactionType": "authCaptureTransaction",' +
            '      "amount": "' +String.valueOf(amount)+ '",' +
            '      "customer": {' +
            '        "email": "' +email+ '"' +
            '      },' +
            '      "billTo": {' +
            '        "firstName": "' +firstName+  '",' +
            '        "lastName": "'  +lastName+  '",' +
            '        "company": "Metadologie",' +
            '        "address": "'  +address+  '",' +
            '        "city": "'  +city+  '",' +
            '        "state": "'  +state+  '",' +
            '        "zip": "'  +zip+  '",' +
            '        "country": "'  +country+  '"' +
            '      }' +
            '    },' +
            '    "hostedPaymentSettings": {' +
            '      "setting": [' +
            '        {' +
            '          "settingName": "hostedPaymentReturnOptions",' +
            '          "settingValue": "{\\"showReceipt\\": true, \\"url\\": \\"https://mysite.com/receipt\\", \\"urlText\\": \\"Continue\\", \\"cancelUrl\\": \\"https://mysite.com/cancel\\", \\"cancelUrlText\\": \\"Cancel\\"}"' +
            '        },' +
            '        {' +
            '          "settingName": "hostedPaymentButtonOptions",' +
            '          "settingValue": "{\\"text\\": \\"Pay\\"}"' +
            '        },' +
            '        {' +
            '          "settingName": "hostedPaymentStyleOptions",' +
            '          "settingValue": "{\\"bgColor\\": \\"blue\\"}"' +
            '        }' +
            '      ]' +
            '    }' +
            '  }' +
            '}';

            System.debug('>> Request Body: ' + requestBody);

            // Call Authorize.Net
            HttpRequest req = new HttpRequest();
            req.setEndpoint(ENDPOINT);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(requestBody);

            Http http = new Http();
            HttpResponse res = http.send(req);

            // handle BOM
            String responseBody = res.getBody();
            if (responseBody != null && responseBody.startsWith('\uFEFF')) {
                responseBody = responseBody.substring(1);
            }

            System.debug('>> Response: ' + responseBody);

            // Parse token
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            if (result.containsKey('token')) {
                return (String) result.get('token');
            } else {
                throw new AuraHandledException('Authorize.Net did not return a token. Response: ' + responseBody);
            }

        } catch (Exception e) {
            System.debug('>> Exception: ' + e.getMessage());
            throw new AuraHandledException('Error fetching token: ' + e.getMessage());
        }
    }
}