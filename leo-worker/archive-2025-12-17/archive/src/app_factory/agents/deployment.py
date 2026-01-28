"""Deployment agent - Step 5 of the App Factory pipeline."""

from cc_agent import Agent


def create_deployment_prompt(frontend_path: str, backend_path: str, app_name: str) -> str:
    """Create the prompt for the deployment agent.
    
    Args:
        frontend_path: Path to the frontend application
        backend_path: Path to the backend application
        app_name: Name of the application for deployment
        
    Returns:
        Formatted prompt for the deployment orchestrator
    """
    return f"""
    Deploy this full-stack application to AWS using CDK.
    
    Application details:
    - Name: {app_name}
    - Frontend: {frontend_path} (Next.js)
    - Backend: {backend_path} (FastAPI)
    
    Create AWS CDK infrastructure for:
    
    1. Backend Infrastructure:
       - DynamoDB tables based on data models
       - Lambda functions for FastAPI backend
       - API Gateway with custom domain
       - Cognito User Pool (if using AWS auth)
       - Secrets Manager for environment variables
       - CloudWatch logs and monitoring
    
    2. Frontend Infrastructure:
       - S3 bucket for static assets
       - CloudFront distribution
       - Route53 DNS records
       - SSL certificate (ACM)
       - Origin Access Identity
    
    3. Shared Infrastructure:
       - VPC with proper subnets (if needed)
       - IAM roles and policies
       - CloudFormation outputs for easy access
    
    4. Deployment Scripts:
       - GitHub Actions workflow for CI/CD
       - Scripts for local deployment
       - Environment-specific configurations (dev, staging, prod)
    
    Structure:
    ```
    infrastructure/
    ├── cdk/
    │   ├── app.py
    │   ├── stacks/
    │   │   ├── backend_stack.py
    │   │   ├── frontend_stack.py
    │   │   └── database_stack.py
    │   └── requirements.txt
    ├── scripts/
    │   ├── deploy.sh
    │   └── destroy.sh
    └── .github/
        └── workflows/
            └── deploy.yml
    ```
    
    Ensure the deployment is production-ready with:
    - Proper security configurations
    - Cost optimization
    - Scalability considerations
    - Monitoring and alerting setup
    """


DEPLOYMENT_AGENT = Agent(
    name="Deployment Orchestrator",
    system_prompt="""You are an AWS CDK and deployment expert.
    Deploy the application to AWS with:
    
    - DynamoDB tables
    - Lambda functions for backend
    - API Gateway
    - CloudFront for frontend
    - S3 for static assets
    - Route53 for domain
    - Proper IAM roles and security
    
    Generate CDK code and deployment scripts.""",
    allowed_tools=["Read", "Write", "Bash"],
    max_turns=10,
    permission_mode="acceptEdits"
)