const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "Products";

exports.handler = async (event) => {
    
    let body;
    let statusCode = 200;
    
    const headers = {
        "Content-Type": "application/json"
    };
    
    let requestJSON;
    
    try {
        switch (event.routeKey) {
        
        case 'POST /items':
            requestJSON = JSON.parse(event.body)
            await dynamo.put({
                TableName,
                Item: {
                    id: requestJSON.id,
                    price: requestJSON.price,
                    name: requestJSON.name
                }
            }).promise();
            body = `Put item ${requestJSON.id}`;
            break;
            
        case 'DELETE /items/{id}':
            console.log(event.pathParameters.id);
            await dynamo.delete({
                TableName,
                Key: {
                    id: event.pathParameters.id
                }
            }).promise();
            body = `Deleted items ${event.pathParameters.id}`;
            break;
            
        case "GET /items/{id}":
            body = await dynamo.get({
                TableName,
                Key: {
                    id: event.pathParameters.id
                }
            }).promise();
            break;
            
        case "GET /items":
            body = await dynamo.scan({TableName: "Products"}).promise();
            break;
            
        case "PUT /items/{id}":
            requestJSON = JSON.parse(event.body);
            await dynamo.update({
                TableName,
                Key: {
                    id: event.pathParameters.id
                },
                UpdateExpression: "set price = :r",
                ExpressionAttributeValues: {
                    ":r": requestJSON.price,
                },
            }).promise();
            break;
        
        default:
            throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
    } catch (e) {
        statusCode = 400;
        body = e.message;
    } finally {
        body = JSON.stringify(body);
    }
    
    const response = {
        statusCode,
        body,
        headers
    };
    return response;
};