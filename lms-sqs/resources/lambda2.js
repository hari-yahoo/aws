const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

exports.handler = async (event) => {
    try {
        // Process messages sequentially
        for (const message of event.Records) {
            await processMessage(message);
            await deleteMessage(message.receiptHandle);
        }
        console.info("All messages processed successfully.");
    } catch (err) {
        console.error("An error occurred while processing messages:", err);
    }
};

async function processMessage(message) {
    try {
        console.log(`Processed message ${message.body}`);
        // TODO: update the database with the details

        await Promise.resolve(1); // Placeholder for actual async work
    } catch (err) {
        console.error("An error occurred while processing a message:", err);
        throw err; // Re-throw the error to indicate failure in processing
    }
}

async function deleteMessage(receiptHandle) {
    try {
        const deleteParams = {
            QueueUrl: process.env.QUEUE_URL, 
            ReceiptHandle: receiptHandle
        };
        await sqs.deleteMessage(deleteParams).promise();
        console.log(`Deleted message with receipt handle: ${receiptHandle}`);
    } catch (err) {
        console.error("An error occurred while deleting a message:", err);
        throw err; // Re-throw the error to indicate failure in deleting
    }
}
