# Masking sensitive information in AWS Step Functions Express
## Overview

This repository contains a demonstration of how to use the [Amazon CloudWatch logs masking feature](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data.html) to mask sensitive information in [AWS Step Functions](https://aws.amazon.com/step-functions/) Express.

This demo will create all necessary cloud resources with the [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) to create the express Step Function with the configured log stream and audit destination.

![Architecture Overview](docs/00-Architecture%20Overview.png)

## Details

This is possible, because for express workflows, the execution history and detailed infos are gathered through CloudWatch logs, see also [here](https://docs.aws.amazon.com/step-functions/latest/dg/diff-standard-express-exec-details-ui.html#exp-wf-exec-limitation-cw-reliance-test). This allows you to use CloudWatch Data Masking capabilities, especially for data fields such as Address, Email, Name, and [many more](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL-managed-data-identifiers.html).

For an example execution with PII relevant data and active masking of Address, Email and Name, this looks like this:
```json
{
    "name": "John Miller",
    "address": "2113 7th Ave, Seattle, WA 98121, United States",
    "key3": "test@example.com",
    "order-id": "test-order-id"
}
```

### 1. Execution details
In the execution details, you can see that the log input (and also other data) is masked.

![Execution details](docs/01-Execution%20details.png)

### 2. Log groups overview
In the log groups overview, you can see that the Data Protection is enabled, and that it identified 4 sensitive informations.

![Log groups overview](docs/02-Log%20groups%20overview.png)

### 3. Log stream masked
In the log stream you can see the masked log events, with the display option to unmask (top right).

![Log stream masked](docs/03-Log%20stream%20masked.png)

### 4. Log stream unmasked
If you select to temporarly unmask protected data, you will see the original input.

![Log stream unmasked](docs/04-Log%20stream%20unmasked.png)

### 5. Log stream unmasked with insufficient permissions
If your role lacks the permission of `logs:Unmask` you are not allowed to see the details, see also [here](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/data-protection-policy-permissions.html) for more information.

![Log stream unmasked with insufficient permissions](docs/05-Log%20stream%20unmasked%20with%20insufficient%20permissions.png)

### 6. Log stream audit destination
If you have enabled an audit destination, you are able to review the [audit findings report](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/mask-sensitive-log-data-audit-findings.html).

![Log stream audit findings report](docs/06-Log%20stream%20audit%20destination.png)

## Prerequisites

Before you begin, make sure you have the following prerequisites in place:

1. **AWS Account:** You will need an AWS account to deploy and run this [projen](https://projen.io/) CDK-based project.

2. **AWS CLI:** Ensure that you have the AWS CLI installed and configured with the necessary AWS credentials. You can install it following the instructions [here](https://aws.amazon.com/cli/).

3. **Node.js:** This project is built using Node.js, so make sure you have Node.js installed. You can download it from the [official website](https://nodejs.org/).

## Usage

To deploy and run this projen CDK-based project, follow these steps:

1. Clone this repository to your local machine:

```bash
git clone https://github.com/moralesl/masking-sensitive-express-step-functions.git
```


2. Navigate to the project directory:
```bash
cd masking-sensitive-express-step-functions
```


3. Install project dependencies:
```bash
npm install && npx projen
```


4. Deploy the CDK stack to your AWS account:
```bash
npx projen deploy
```


5. After the deployment is complete, the CDK will output a state machine ARN, export it so that you can use it to invoke the API
```bash
export STATE_MACHINE_ARN=<Set the output URL>
```

It should look similar to this
> Outputs:
> masking-sensitive-express-step-functions-dev.LoggingAndMaskingWorkflowArn = arn:aws:states:eu-central-1:123456789012:stateMachine:LoggingAndMaskingWorkflow

Result would be for this example
```bash
export STATE_MACHINE_ARN=arn:aws:states:eu-central-1:123456789012:stateMachine:LoggingAndMaskingWorkflow
```

6. Invoke the state machine, make sure that you have valid AWS credentials
```bash
npx projen invoke-state-machine
```

7. Retrieve the logs
```bash
sam logs --stack-name masking-sensitive-express-step-functions-dev
```

This should result in a similar output like this:
```bash
states/LoggingAndMaskingWorkflow/2024-04-24-11-50/00000000 2024-04-24T11:54:30.672000 {
  "id": "1",
  "type": "ExecutionStarted",
  "details": {
    "input": "{\"name\":\"***********\",\"address\":\"**********************************************\",\"key3\":\"****************\",\"order-id\": \"test-order-id\"}",
    "inputDetails": {
      "truncated": false
    },
    "roleArn": "arn:aws:iam::123456789012:role/masking-sensitive-express-LoggingAndMaskingWorkflow-PrqsMkZA1j2J"
  },
  "previous_event_id": "0",
  "event_timestamp": "1713959670672",
  "execution_arn": "arn:aws:states:eu-central-1:123456789012:express:LoggingAndMaskingWorkflow:cli-test-run:4135929f-8d60-4ea5-b3c3-b243bec43271",
  "redrive_count": "0"
}
states/LoggingAndMaskingWorkflow/2024-04-24-11-50/00000000 2024-04-24T11:54:30.680000 {
  "id": "2",
  "type": "PassStateEntered",
  "details": {
    "input": "{\"name\":\"***********\",\"address\":\"**********************************************\",\"key3\":\"****************\",\"order-id\": \"test-order-id\"}",
    "inputDetails": {
      "truncated": false
    },
    "name": "LogInput"
  },
  "previous_event_id": "0",
  "event_timestamp": "1713959670680",
  "execution_arn": "arn:aws:states:eu-central-1:123456789012:express:LoggingAndMaskingWorkflow:cli-test-run:4135929f-8d60-4ea5-b3c3-b243bec43271",
  "redrive_count": "0"
}
states/LoggingAndMaskingWorkflow/2024-04-24-11-50/00000000 2024-04-24T11:54:30.680000 {
  "id": "3",
  "type": "PassStateExited",
  "details": {
    "name": "LogInput",
    "output": "{\"name\":\"***********\",\"address\":\"**********************************************\",\"key3\":\"****************\",\"order-id\": \"test-order-id\"}",
    "outputDetails": {
      "truncated": false
    }
  },
  "previous_event_id": "2",
  "event_timestamp": "1713959670680",
  "execution_arn": "arn:aws:states:eu-central-1:123456789012:express:LoggingAndMaskingWorkflow:cli-test-run:4135929f-8d60-4ea5-b3c3-b243bec43271",
  "redrive_count": "0"
}
states/LoggingAndMaskingWorkflow/2024-04-24-11-50/00000000 2024-04-24T11:54:30.680000 {
  "id": "4",
  "type": "ExecutionSucceeded",
  "details": {
    "output": "{\"name\":\"***********\",\"address\":\"**********************************************\",\"key3\":\"****************\",\"order-id\": \"test-order-id\"}",
    "outputDetails": {
      "truncated": false
    }
  },
  "previous_event_id": "3",
  "event_timestamp": "1713959670680",
  "execution_arn": "arn:aws:states:eu-central-1:123456789012:express:LoggingAndMaskingWorkflow:cli-test-run:4135929f-8d60-4ea5-b3c3-b243bec43271",
  "redrive_count": "0"
}
```

8. To clean up the resources, run the following command:
```bash
npx projen destroy
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

