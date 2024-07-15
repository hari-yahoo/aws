const { Stack, Duration } = require('aws-cdk-lib');
// const sqs = require('aws-cdk-lib/aws-sqs');
const sqs = require('aws-cdk-lib/aws-sqs');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const eventsources = require('aws-cdk-lib/aws-lambda-event-sources');

class LmsSqsStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'LmsSqsQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });
    // Create SQS Queue
    const queue = new sqs.Queue(this, 'LmsSqsQueue.fifo', {
      visibilityTimeout: Duration.seconds(300)
    });


    // Create Lambda Function
    const lambdaFunction = new lambda.Function(this, 'ProcessMessages', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resouces'),
      handler: 'lambda.handler'
    });

    // Grant the Lambda function permissions to interact with the SQS queue
    queue.grantConsumeMessages(lambdaFunction);

    // Add SQS event source to the Lambda function
    lambdaFunction.addEventSource(new eventsources.SqsEventSource(queue));

    // Create API Gateway REST API
    const api = new apigateway.RestApi(this, 'LMSHook', {
      restApiName: 'LMS WebHook',
      description: 'LMS invokes this API with payload',
      deployOptions: {
        stageName: 'dev'
      }
    });

    // Integrate the API Gateway with the SQS queue
    const queueIntegration = new apigateway.AwsIntegration({
      service: 'sqs',
      path: `${cdk.Aws.ACCOUNT_ID}/${queue.queueName}`,
      options: {
        credentialsRole: new iam.Role(this, 'ApiGatewaySqsRole', {
          assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess')
          ]
        }),
        requestParameters: {
          'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'"
        },
        requestTemplates: {
          'application/json': `Action=SendMessage&MessageBody=$util.urlEncode("$input.body")&QueueUrl=${queue.queueUrl}`
        },
        integrationResponses: [{
          statusCode: '200',
          responseTemplates: {
            'application/json': '{"done": true}'
          }
        }]
      }
    });


    // Define a new API resource and method
    const resource = api.root.addResource('myresource');
    resource.addMethod('POST', queueIntegration, {
      methodResponses: [{ statusCode: '200' }]
    });
    

  }
}

module.exports = { LmsSqsStack }
