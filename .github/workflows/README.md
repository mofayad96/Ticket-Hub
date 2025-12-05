# GitHub Actions Workflows

## 📋 Available Workflows

### 1. `deploy-ticket-hub.yaml` (Main Deployment Pipeline)

**Complete CI/CD pipeline** that builds, tests, and deploys the entire Ticket Hub application to AWS.

**Triggers:**
- Push to `main` or `master` branch
- Manual trigger via GitHub Actions UI

**Jobs:**
1. **Build Backend** - Build and push backend Docker image
2. **Build Frontend** - Build and push frontend Docker image
3. **Terraform** - Provision AWS infrastructure
4. **Deploy** - Deploy application to EC2

**Features:**
- ✅ SonarQube code quality scanning
- ✅ Docker image building and pushing
- ✅ Trivy security scanning
- ✅ Terraform infrastructure provisioning
- ✅ Automated deployment to EC2
- ✅ Slack notifications at each stage
- ✅ Health checks after deployment

### 2. `ticket-hub-backend-ci-cd.yaml` (Legacy - Backend Only)

Builds and scans backend image only. Use for backend-only changes.

### 3. `ticket-hub-frontend-ci-cd.yaml` (Legacy - Frontend Only)

Builds and scans frontend image only. Use for frontend-only changes.

## 🔐 Required Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

### Docker Hub
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASS` - Docker Hub access token

### AWS
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### SonarQube
- `SONAR_TOKEN` - SonarCloud authentication token

### Application
- `JWT_SECRET` - JWT secret for backend
- `MONGO_ROOT_PASSWORD` - MongoDB root password

### Notifications
- `SLACK_WEBHOOK_URL` - Slack webhook URL for notifications

## 🚀 How to Use

### Automatic Deployment

Push to main branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The workflow will automatically:
1. Build Docker images
2. Run security scans
3. Provision infrastructure
4. Deploy to EC2
5. Send Slack notifications

### Manual Deployment

1. Go to **Actions** tab in GitHub
2. Select **Deploy Ticket Hub to AWS**
3. Click **Run workflow**
4. Choose environment (production/staging)
5. Click **Run workflow**

## 📊 Workflow Stages

```
┌─────────────────────────────────────────────────────────┐
│                    Trigger (Push/Manual)                 │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │ Build Backend │       │Build Frontend │
        │               │       │               │
        │ • SonarQube   │       │ • SonarQube   │
        │ • Docker Build│       │ • Docker Build│
        │ • Trivy Scan  │       │ • Trivy Scan  │
        │ • Push Image  │       │ • Push Image  │
        └───────────────┘       └───────────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                    ┌───────────────┐
                    │   Terraform   │
                    │               │
                    │ • Init        │
                    │ • Plan        │
                    │ • Apply       │
                    │ • Get EC2 Info│
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Deploy     │
                    │               │
                    │ • Install     │
                    │   Docker      │
                    │ • Copy Files  │
                    │ • Start App   │
                    │ • Health Check│
                    └───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Slack Notify  │
                    └───────────────┘
```

## 🔔 Slack Notifications

You'll receive Slack notifications for:

1. **Backend Build Complete**
   ```
   🔨 Backend Build finished for repo/name on branch main
   Status: success
   Commit: abc123...
   ```

2. **Frontend Build Complete**
   ```
   🎨 Frontend Build finished for repo/name on branch main
   Status: success
   Commit: abc123...
   ```

3. **Terraform Complete**
   ```
   🏗️ Terraform finished for repo/name
   Status: success
   Instance ID: i-xxxxx
   Instance IP: x.x.x.x
   ```

4. **Deployment Success**
   ```
   ✅ Deployment Successful!
   
   Repository: repo/name
   Branch: main
   Instance ID: i-xxxxx
   
   Access URLs:
   • Frontend: http://x.x.x.x:3000
   • Backend: http://x.x.x.x:4000
   • Grafana: http://x.x.x.x:3001
   • Prometheus: http://x.x.x.x:9090
   ```

5. **Deployment Failure**
   ```
   ❌ Deployment Failed!
   
   Repository: repo/name
   Branch: main
   Instance ID: i-xxxxx
   
   Please check the GitHub Actions logs for details.
   ```

## 🛠️ Customization

### Change Deployment Region

Edit `.github/workflows/deploy-ticket-hub.yaml`:
```yaml
env:
  AWS_REGION: eu-central-1  # Change this
```

### Change Docker Registry

Edit `.github/workflows/deploy-ticket-hub.yaml`:
```yaml
env:
  DOCKER_USERNAME: deaddeal96  # Change this
```

### Add More Environments

Add to workflow inputs:
```yaml
inputs:
  environment:
    type: choice
    options:
      - production
      - staging
      - development  # Add this
```

### Skip Certain Jobs

Add conditions:
```yaml
jobs:
  terraform:
    if: github.ref == 'refs/heads/main'  # Only on main branch
```

## 📈 Monitoring Workflow Runs

### View Logs

1. Go to **Actions** tab
2. Click on a workflow run
3. Click on a job to see logs
4. Expand steps to see details

### Download Artifacts

Security scan reports are uploaded as artifacts:
1. Go to workflow run
2. Scroll to **Artifacts** section
3. Download `trivy-backend-report` or `trivy-frontend-report`

## 🐛 Troubleshooting

### Build Fails

**Issue**: Docker build fails

**Solution**:
- Check Dockerfile syntax
- Verify build context
- Check Docker Hub credentials

### Terraform Fails

**Issue**: Terraform apply fails

**Solution**:
- Check AWS credentials
- Verify VPC/subnet IDs in `terraform/main.tf`
- Check Terraform state

### Deployment Fails

**Issue**: Cannot connect to EC2

**Solution**:
- Verify EC2 instance is running
- Check security group allows SSM
- Verify IAM role has SSM permissions

### Health Check Fails

**Issue**: Application not responding

**Solution**:
- Check Docker containers are running
- Verify environment variables
- Check application logs

## 📚 Related Documentation

- **`../../CI_CD_SETUP.md`** - Detailed CI/CD setup guide
- **`../../TERRAFORM_NOTES.md`** - Terraform configuration
- **`../../SECURITY_CHECKLIST.md`** - Security best practices

## 🔗 Useful Commands

```bash
# Trigger workflow manually
gh workflow run deploy-ticket-hub.yaml

# List workflow runs
gh run list --workflow=deploy-ticket-hub.yaml

# View workflow run logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

## ⚠️ Important Notes

1. **First Run**: May take 10-15 minutes (Docker installation)
2. **Subsequent Runs**: ~5-7 minutes
3. **Costs**: ~$0.10 per deployment (AWS charges)
4. **Secrets**: Never commit secrets to repository
5. **State**: Terraform state is stored locally in workflow

## 🎯 Best Practices

1. **Test Locally First**: Test Docker builds locally before pushing
2. **Use Branches**: Use feature branches and PR workflow
3. **Monitor Costs**: Check AWS billing regularly
4. **Review Scans**: Check Trivy reports for vulnerabilities
5. **Update Dependencies**: Keep actions versions updated

---

**Quick Start:**
1. Add required secrets to GitHub
2. Push to main branch
3. Watch workflow run in Actions tab
4. Check Slack for notifications
5. Access your application!
