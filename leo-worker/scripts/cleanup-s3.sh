#!/bin/bash
# Cleanup script for leo-saas-generated-apps S3 bucket
# Deletes all test generations

BUCKET="leo-saas-generated-apps-855235011337"
PROFILE="${AWS_PROFILE:-jake-dev}"

echo "=== S3 Cleanup Script ==="
echo "Bucket: $BUCKET"
echo "Profile: $PROFILE"
echo ""

# List current contents
echo "Current contents:"
aws s3 ls s3://$BUCKET/generations/ --recursive --profile $PROFILE

echo ""
read -p "Delete all generations? (y/N) " confirm

if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
    echo "Deleting..."
    aws s3 rm s3://$BUCKET/generations/ --recursive --profile $PROFILE
    echo "Done!"
else
    echo "Aborted."
fi
