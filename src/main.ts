import { App, CfnOutput, Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { DataIdentifier, DataProtectionPolicy, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { DefinitionBody, LogLevel, Pass, StateMachine, StateMachineType } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

export class MaskingSensitiveExpressStepFunctionStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const piiDetectedLogGroup = new LogGroup(this, 'PiiDetectedLogGroup', {
      removalPolicy: RemovalPolicy.DESTROY, // For development purpose only
      retention: RetentionDays.ONE_DAY, // For development purpose only
    });

    const maskedLogGroup = new LogGroup(this, 'MaskedLogGroup', {
      dataProtectionPolicy: new DataProtectionPolicy({
        logGroupAuditDestination: piiDetectedLogGroup,
        description: 'Masks PII for name, address and email address',
        identifiers: [DataIdentifier.ADDRESS, DataIdentifier.EMAILADDRESS, DataIdentifier.NAME],
      }),

      removalPolicy: RemovalPolicy.DESTROY, // For development purpose only
      retention: RetentionDays.ONE_DAY, // For development purpose only
    });

    const loggingAndMaskingWorkflow = new StateMachine(this, 'LoggingAndMaskingWorkflow', {
      definitionBody: DefinitionBody.fromChainable(new Pass(this, 'LogInput')),
      stateMachineName: 'LoggingAndMaskingWorkflow',

      stateMachineType: StateMachineType.EXPRESS,
      timeout: Duration.seconds(5),
      logs: {
        destination: maskedLogGroup,
        level: LogLevel.ALL,
        includeExecutionData: true,
      },
    });

    // Create cdk output for the state machine
    new CfnOutput(this, 'LoggingAndMaskingWorkflowArn', {
      value: loggingAndMaskingWorkflow.stateMachineArn,
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

const stack = new MaskingSensitiveExpressStepFunctionStack(app, 'masking-sensitive-express-step-functions-dev', {
  env: devEnv,
});
Tags.of(stack).add('project', 'masking-sensitive-express-step-functions');

app.synth();
