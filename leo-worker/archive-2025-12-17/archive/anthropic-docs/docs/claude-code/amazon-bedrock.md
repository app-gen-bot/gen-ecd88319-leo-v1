# Claude Code on Amazon Bedrock

**Source:** https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock
**Retrieved:** 2025-07-04

---

## ​Prerequisites

Before configuring Claude Code with Bedrock, ensure you have:

- An AWS account with Bedrock access enabled
- Access to desired Claude models (e.g., Claude Sonnet 4) in Bedrock
- AWS CLI installed and configured (optional - only needed if you don’t have another mechanism for getting credentials)
- Appropriate IAM permissions

## ​Setup

### ​1. Enable model access

First, ensure you have access to the required Claude models in your AWS account:

1. Navigate to the[Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Go to**Model access**in the left navigation
3. Request access to desired Claude models (e.g., Claude Sonnet 4)
4. Wait for approval (usually instant for most regions)

### ​2. Configure AWS credentials

Claude Code uses the default AWS SDK credential chain. Set up your credentials using one of these methods:

Claude Code does not currently support dynamic credential management (such as automatically calling`aws sts assume-role`). You will need to run`aws configure`,`aws sso login`, or set the`AWS_`environment variables yourself.

**Option A: AWS CLI configuration**

```bash
aws configure

```

**Option B: Environment variables (access key)**

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token

```

**Option C: Environment variables (SSO profile)**

```bash
aws sso login --profile=<your-profile-name>

export AWS_PROFILE=your-profile-name

```

### ​3. Configure Claude Code

Set the following environment variables to enable Bedrock:

```bash

# Enable Bedrock integration

export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # or your preferred region

```

`AWS_REGION`is a required environment variable. Claude Code does not read from the`.aws`config file for this setting.

### ​4. Model configuration

Claude Code uses these default models for Bedrock:

| Model type | Default value |
| --- | --- |
| Primary model | us.anthropic.claude-3-7-sonnet-20250219-v1:0 |
| Small/fast model | us.anthropic.claude-3-5-haiku-20241022-v1:0 |

To customize models, use one of these methods:

```bash

# Using inference profile ID

export ANTHROPIC_MODEL='us.anthropic.claude-opus-4-20250514-v1:0'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-3-5-haiku-20241022-v1:0'

# Using application inference profile ARN

export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'

```

## ​IAM configuration

Create an IAM policy with the required permissions for Claude Code.

For details, see[Bedrock IAM documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html).

We recommend creating a dedicated AWS account for Claude Code to simplify cost tracking and access control.

## ​Troubleshooting

If you encounter region issues:

- Check model availability:`aws bedrock list-inference-profiles --region your-region`
- Switch to a supported region:`export AWS_REGION=us-east-1`
- Consider using inference profiles for cross-region access

If you receive an error “on-demand throughput isn’t supported”:

- Specify the model as an[inference profile](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)ID

## ​Additional resources

- [Bedrock documentation](https://docs.aws.amazon.com/bedrock/)
- [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Bedrock inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
- [Claude Code on Amazon Bedrock: Quick Setup Guide](https://community.aws/content/2tXkZKrZzlrlu0KfH8gST5Dkppq/claude-code-on-amazon-bedrock-quick-setup-guide)
[Overview](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations)[Google Vertex AI](https://docs.anthropic.com/en/docs/claude-code/google-vertex-ai)On this page
- [Prerequisites](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#prerequisites)
- [Setup](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#setup)
- [1. Enable model access](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#1-enable-model-access)
- [2. Configure AWS credentials](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#2-configure-aws-credentials)
- [3. Configure Claude Code](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#3-configure-claude-code)
- [4. Model configuration](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#4-model-configuration)
- [IAM configuration](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#iam-configuration)
- [Troubleshooting](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#troubleshooting)
- [Additional resources](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock#additional-resources)