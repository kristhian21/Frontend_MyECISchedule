var topicConnection = (function () {

    async function main() {

    }

    function connectToTopic() {
        const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");
        const connectionString = "Endpoint=sb://myecischedule.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=lpgUwYkLzW82790Avf9OGBfStIelBGgkw8zr5BmtS/E=";
        const topicName = "topicosmyecischeduale";
        const subscriptionName = "Customer";
        
        // create a Service Bus client using the connection string to the Service Bus namespace
        const sbClient = new ServiceBusClient(connectionString);

        // createReceiver() can also be used to create a receiver for a queue.
        const receiver = sbClient.createReceiver(topicName, subscriptionName);

        // function to handle messages
        const myMessageHandler = async (messageReceived) => {
            console.log(`Received message: ${messageReceived.body}`);
        };

        // function to handle any errors
        const myErrorHandler = async (error) => {
            console.log(error);
        };

        // subscribe and specify the message and error handlers
        receiver.subscribe({
            processMessage: myMessageHandler,
            processError: myErrorHandler
        });
    }

    return {
        connect: connectToTopic
    };
})();