# Quick Start: Fast Development Setup (30 Minutes)

**Goal**: Get 10x faster container builds using your existing EC2 instance, without complex CDK changes.

**What You Already Have**: ✅ Running EC2 instance with AWS network speed

**What We'll Do**: Configure it for fast Docker builds + ECR pushes in 30 minutes

---

## Option A: Use Your Existing EC2 Instance (Recommended - Fastest)

### Step 1: Gather EC2 Info (Use This Prompt)

**Copy this prompt and give it to another AI to gather your EC2 details:**

```
I need information about my running EC2 instance for development setup. Please run these commands and provide the output:

1. List my running EC2 instances:
   aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name,PublicIpAddress,PrivateIpAddress,IamInstanceProfile.Arn,Tags[?Key==`Name`].Value|[0]]' --output table

2. Get my AWS account ID:
   aws sts get-caller-identity

3. Get my current region:
   aws configure get region

4. Check if the instance has an IAM role:
   aws ec2 describe-instances --instance-ids <INSTANCE_ID_FROM_STEP1> --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn'

5. If it has a role, show what permissions it has:
   ROLE_NAME=$(aws ec2 describe-instances --instance-ids <INSTANCE_ID> --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn' --output text | cut -d'/' -f2)
   aws iam get-role --role-name $ROLE_NAME
   aws iam list-attached-role-policies --role-name $ROLE_NAME
   aws iam list-role-policies --role-name $ROLE_NAME

Please provide:
- Instance ID
- Instance Type
- Public IP (if any)
- IAM Role Name (if attached)
- Current permissions summary
```

---

### Step 2: Connect to Your EC2 Instance

**Option 2a: SSH (if you have SSH access)**
```bash
# From your laptop
ssh -i ~/.ssh/your-key.pem ec2-user@<PUBLIC_IP>
```

**Option 2b: SSM Session Manager (if no SSH)**
```bash
# From your laptop
aws ssm start-session --target <INSTANCE_ID>
```

**Option 2c: EC2 Instance Connect (browser-based)**
- Go to EC2 Console → Instances → Select instance → Connect

---

### Step 3: One-Time Setup on EC2 (10 minutes)

**Run this setup script on your EC2 instance:**

```bash
#!/bin/bash
set -e

echo "🚀 Setting up fast development environment..."

# Update system
sudo yum update -y

# Install Docker (if not already installed)
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo yum install -y docker
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker $USER
  echo "⚠️  You'll need to logout and login again for Docker permissions"
fi

# Install Docker Buildx (for fast builds with cache)
if ! docker buildx version &> /dev/null; then
  echo "Installing Docker Buildx..."
  mkdir -p ~/.docker/cli-plugins
  curl -SL https://github.com/docker/buildx/releases/download/v0.12.0/buildx-v0.12.0.linux-amd64 \
    -o ~/.docker/cli-plugins/docker-buildx
  chmod +x ~/.docker/cli-plugins/docker-buildx
fi

# Install Node.js 20 (if not already installed)
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo yum install -y nodejs
fi

# Install Git (if not already installed)
if ! command -v git &> /dev/null; then
  echo "Installing Git..."
  sudo yum install -y git
fi

# Install Python 3.11 (for app-gen)
if ! python3.11 --version &> /dev/null; then
  echo "Installing Python 3.11..."
  sudo yum install -y python3.11 python3.11-pip
fi

# Create workspace
mkdir -p ~/workspace
cd ~/workspace

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Logout and login again (for Docker group)"
echo "2. Clone your repos to ~/workspace/"
echo "3. Run the build script"
```

Save as `setup-dev-ec2.sh` and run:
```bash
chmod +x setup-dev-ec2.sh
./setup-dev-ec2.sh

# Logout and login again
exit
# Then reconnect via SSH/SSM
```

---

### Step 4: Clone Your Repos (2 minutes)

```bash
cd ~/workspace

# Clone the three repos (adjust URLs to your actual repos)
git clone https://github.com/YOUR_ORG/app-gen-infra.git
git clone https://github.com/YOUR_ORG/app-gen-saas.git
git clone https://github.com/YOUR_ORG/app-gen.git

# Checkout correct branches
cd app-gen-infra && git checkout leonardo && cd ..
cd app-gen-saas && git checkout leonardo && cd ..
cd app-gen && git checkout leonardo-saas && cd ..

echo "✅ Repos cloned and on correct branches"
```

---

### Step 5: Fast Build Script (5 minutes setup, then 2-4 min builds)

Create `~/workspace/fast-build.sh`:

```bash
#!/bin/bash
set -e

# Configuration
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_REGION:-us-east-1}
ECR_BASE="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
WORKSPACE=~/workspace

echo "🏗️  Fast Build & Push to ECR"
echo "Account: $ACCOUNT"
echo "Region: $REGION"
echo ""

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_BASE

# Create buildx builder (if not exists)
if ! docker buildx ls | grep -q appgen-builder; then
  echo "Creating buildx builder..."
  docker buildx create --use --name appgen-builder --driver docker-container
else
  docker buildx use appgen-builder
fi

# Build app-gen-saas (orchestrator)
echo ""
echo "📦 Building app-gen-saas (orchestrator)..."
docker buildx build $WORKSPACE/app-gen-saas \
  --platform linux/amd64 \
  --tag $ECR_BASE/app-gen-saas-app:dev \
  --tag $ECR_BASE/app-gen-saas-app:latest \
  --cache-from type=registry,ref=$ECR_BASE/app-gen-saas-app:cache \
  --cache-to type=registry,ref=$ECR_BASE/app-gen-saas-app:cache,mode=max \
  --push \
  --progress=plain

echo ""
echo "✅ app-gen-saas pushed to ECR"

# Build app-gen (generator)
echo ""
echo "📦 Building app-gen (generator)..."
docker buildx build $WORKSPACE/app-gen \
  --platform linux/amd64 \
  --tag $ECR_BASE/app-gen-saas-generator:dev \
  --tag $ECR_BASE/app-gen-saas-generator:latest \
  --cache-from type=registry,ref=$ECR_BASE/app-gen-saas-generator:cache \
  --cache-to type=registry,ref=$ECR_BASE/app-gen-saas-generator:cache,mode=max \
  --push \
  --progress=plain

echo ""
echo "✅ app-gen pushed to ECR"

echo ""
echo "🎉 Build complete!"
echo ""
echo "Images pushed:"
echo "  - $ECR_BASE/app-gen-saas-app:latest"
echo "  - $ECR_BASE/app-gen-saas-generator:latest"
echo ""
echo "Next: Update ECS service to pull new images"
echo "  aws ecs update-service --cluster app-gen-saas-cluster --service AppGenSaasService --force-new-deployment"
```

Make it executable:
```bash
chmod +x ~/workspace/fast-build.sh
```

---

### Step 6: First Build (5-10 minutes)

```bash
cd ~/workspace
./fast-build.sh
```

**Expected time**:
- First build: 5-10 minutes (downloads all layers)
- Subsequent builds: **2-4 minutes** (cache hit!)

---

### Step 7: Deploy to ECS (2 minutes)

After build completes, update your ECS service:

```bash
# Force ECS to pull the new :latest images
aws ecs update-service \
  --cluster app-gen-saas-cluster \
  --service AppGenSaasService \
  --force-new-deployment

# Watch the deployment
aws ecs describe-services \
  --cluster app-gen-saas-cluster \
  --services AppGenSaasService \
  --query 'services[0].deployments'
```

**Done!** Your new code is now running in production.

---

### Step 8: Daily Workflow (FAST!)

**Every time you make changes:**

```bash
# 1. SSH/SSM into EC2
aws ssm start-session --target <INSTANCE_ID>

# 2. Pull latest code (or edit directly on EC2)
cd ~/workspace/app-gen-saas
git pull

# 3. Build and push (2-4 minutes with cache!)
cd ~/workspace
./fast-build.sh

# 4. Deploy to ECS (2 minutes)
aws ecs update-service \
  --cluster app-gen-saas-cluster \
  --service AppGenSaasService \
  --force-new-deployment

# Total: 4-6 minutes from code change to production! 🚀
```

---

## Option B: Laptop-Based Alternative (Simpler, but Slower)

If you want to stay on your laptop for most work, here's a hybrid approach:

### Daily Development Workflow

**Phase 1: Code on Laptop (npm run dev)**
```bash
# On your laptop
cd ~/NEW/WORK/APP_GEN/app-gen-saas
npm run dev

# Make changes, test locally with HMR
# Frontend changes are instant
```

**Phase 2: Build on EC2 When Ready to Deploy**
```bash
# Option 2a: Use VS Code Remote-SSH
# Install "Remote - SSH" extension
# Connect to EC2 via SSH
# Open ~/workspace folder
# Use integrated terminal to run ./fast-build.sh

# Option 2b: Push to Git, Pull on EC2
cd ~/NEW/WORK/APP_GEN/app-gen-saas
git add .
git commit -m "Update feature X"
git push

# Then SSH to EC2 and pull
ssh ec2-user@<IP>
cd ~/workspace/app-gen-saas
git pull
cd ~/workspace
./fast-build.sh
```

**Best of Both Worlds**:
- Code locally with fast HMR
- Build remotely with fast AWS network
- Deploy in minutes instead of hours

---

## Laptop-Only Alternative (No EC2 Changes Needed)

If you don't want to configure EC2 at all, here's how to speed up laptop builds:

### 1. Use Docker Buildx with Remote Builder

```bash
# On your laptop, create a buildx builder that uses EC2 as remote build host
docker buildx create \
  --name ec2-builder \
  --driver docker-container \
  --driver-opt network=host \
  ssh://ec2-user@<EC2_IP>

docker buildx use ec2-builder

# Now builds run on EC2, but you control from laptop!
docker buildx build . \
  --tag <ECR>/app-gen-saas-app:latest \
  --cache-from type=registry,ref=<ECR>/app-gen-saas-app:cache \
  --cache-to type=registry,ref=<ECR>/app-gen-saas-app:cache,mode=max \
  --push
```

**Pros**: Stay on laptop, builds run on EC2
**Cons**: Sends entire build context over network (slower than running directly on EC2)

---

## Speed Comparison

| Approach | First Build | Incremental Build | Setup Time |
|----------|-------------|-------------------|------------|
| **Laptop (current)** | 15-30 min | 10-20 min | 0 min (already working) |
| **EC2 Direct (recommended)** | 5-10 min | **2-4 min** ⚡ | 30 min (one-time) |
| **Laptop + Remote Buildx** | 8-15 min | 5-10 min | 10 min (one-time) |
| **VS Code Remote** | 5-10 min | 2-4 min | 15 min (one-time) |

---

## IAM Permissions Check

Your EC2 instance needs these permissions. Run this to check:

```bash
# On EC2, test ECR access
aws ecr describe-repositories --repository-names app-gen-saas-app

# If you get "AccessDenied", you need to add permissions
```

**If permissions are missing**, create this policy and attach to EC2 instance role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    }
  ]
}
```

**Quick fix** (if you have admin access):
```bash
# From your laptop (with AWS CLI configured)
INSTANCE_ID=<your-instance-id>
ROLE_NAME=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn' --output text | cut -d'/' -f2)

# Attach ECR permissions
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# Attach ECS permissions
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
```

---

## VS Code Remote (Best Developer Experience)

For the ultimate setup (feels like coding locally, builds on EC2):

### 1. Install VS Code Extension
- Install "Remote - SSH" extension

### 2. Configure SSH
Add to `~/.ssh/config` on your laptop:
```
Host app-gen-ec2
  HostName <EC2_PUBLIC_IP>
  User ec2-user
  IdentityFile ~/.ssh/your-key.pem
  ServerAliveInterval 60
```

Or for SSM (no SSH key needed):
```
Host app-gen-ec2
  HostName <INSTANCE_ID>
  User ec2-user
  ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
  ServerAliveInterval 60
```

### 3. Connect in VS Code
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Remote-SSH: Connect to Host"
3. Select `app-gen-ec2`
4. Open folder: `/home/ec2-user/workspace`

### 4. Develop
- Edit files (feels local, saved on EC2)
- Use integrated terminal to run `./fast-build.sh`
- All the speed of EC2, all the UX of local development!

---

## Troubleshooting

### "Permission denied" when running Docker
```bash
# You're not in the docker group yet
sudo usermod -aG docker $USER
exit
# Reconnect
```

### "docker buildx: command not found"
```bash
# Reinstall buildx plugin
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/buildx/releases/download/v0.12.0/buildx-v0.12.0.linux-amd64 \
  -o ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx
```

### "ECR authentication failed"
```bash
# Re-login
REGION=us-east-1
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com
```

### Build cache not working
```bash
# First build won't have cache - that's expected
# Second build should be much faster
# If still slow, check ECR has the :cache tags:
aws ecr describe-images --repository-name app-gen-saas-app --query 'imageDetails[*].imageTags'
```

### VS Code Remote disconnects frequently
```bash
# Add to your SSH config:
ServerAliveInterval 60
TCPKeepAlive yes
```

---

## Summary: Recommended Quick Start

**30-Minute Setup** (one time):
1. Connect to your existing EC2 instance
2. Run the setup script (install Docker, Node, Git)
3. Clone repos to `~/workspace`
4. Create `fast-build.sh` script
5. Run first build (5-10 min)

**Daily Workflow** (4-6 minutes per deploy):
1. Edit code (on laptop with VS Code Remote, or directly on EC2)
2. Run `./fast-build.sh` (2-4 min with cache)
3. Run `aws ecs update-service --force-new-deployment` (2 min)
4. Done! New code in production

**Result**: **10x faster than building on laptop** (30 min → 3 min)

---

## Next Steps

1. Use the "Gather EC2 Info" prompt above with another AI
2. Connect to EC2 and run the setup script
3. Clone repos and create fast-build.sh
4. Run your first fast build
5. Celebrate 2-minute builds! 🎉

Questions? Check the troubleshooting section or the full `aws-dev-plan.md` for details.
