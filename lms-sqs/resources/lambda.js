exports.handler = async (event, context) => {

    event.Records.array.forEach(async (message) => {
        await processMessageAsync(message);


        var sqs = new AWS.SQS();

        sqs.deleteMessage({
            QueueUrl: "",
            ReceiptHandle: receiptHandle
        });
    });
    for (const message of event.Records) {
        

    }
    console.info("done");
};

async function processMessageAsync(message) {
    try {
        console.log(`Processed message ${message.body}`);
        // TODO: Do interesting work based on the new message
        await Promise.resolve(1); //Placeholder for actual async work
    } catch (err) {
        console.error("An error occurred");
        throw err;
    }
}