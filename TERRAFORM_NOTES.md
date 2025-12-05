# Terraform Configuration Notes

## What Terraform Manages

### ✅ Created by Terraform
- EC2 instance (t2.small)
- Security group with required ports
- Basic system setup (updates, utilities)

### ❌ NOT Managed by Terraform
- Docker installation (use `scripts/install-docker.sh`)
- Elastic IP association (manage manually via AWS Console or CLI)
- Application deployment (use CI/CD or `deploy-to-ec2.sh`)

## Elastic IP Management

The Elastic IP is **not** managed by Terraform. You need to associate it manually.

### Option 1: AWS Console
1. Go to EC2 → Elastic IPs
2. Select your Elastic IP (`eipalloc-0d473fa716949db80`)
3. Actions → Associate Elastic IP address
4. Select your EC2 instance
5. Click Associate

### Option 2: AWS CLI
```bash
# Get instance ID from Terraform
INSTANCE_ID=$(cd terraform && terraform output -raw instance_id)

# Associate Elastic IP
aws ec2 associate-address \
  --instance-id $INSTANCE_ID \
  --allocation-id eipalloc-0d473fa716949db80 \
  --region eu-central-1
```

### Option 3: Add to Terraform (if needed)
If you want Terraform to manage the Elastic IP association, add this to `terraform/main.tf`:

```hcl
resource "aws_eip_association" "app_eip_assoc" {
  instance_id   = aws_instance.app_server.id
  allocation_id = "eipalloc-0d473fa716949db80"
}
```

## Terraform Outputs

After running `terraform apply`, you'll get:

```
instance_id         = "i-xxxxxxxxxxxxx"
instance_public_ip  = "x.x.x.x"  # Temporary public IP
security_group_id   = "sg-xxxxxxxxxxxxx"
ssh_command         = "ssh -i mykey.pem ubuntu@x.x.x.x"
```

**Note**: The `instance_public_ip` is a temporary IP. After associating your Elastic IP, use that IP instead.

## Infrastructure Overview

```
Your AWS Account
├── VPC (vpc-0f462ce79c9a240c3)
│   ├── Public Subnet (subnet-035f3e26f8d4520a8)
│   │   └── EC2 Instance ← Created by Terraform
│   │       ├── Security Group ← Created by Terraform
│   │       └── Elastic IP ← Associate manually
│   ├── Private Subnet (subnet-0b0172b6b7cc75db0)
│   ├── Internet Gateway (igw-08803e257b68e023a)
│   └── NAT Gateway (nat-0ed69ba8be2d2d84c)
```

## Deployment Flow

1. **Create Infrastructure**
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

2. **Associate Elastic IP** (manual)
   - Via AWS Console or CLI (see above)

3. **Install Docker** (first time)
   ```bash
   ssh -i mykey.pem ubuntu@YOUR_ELASTIC_IP < scripts/install-docker.sh
   ```

4. **Deploy Application**
   ```bash
   ./deploy-to-ec2.sh
   ```

## Why Elastic IP is Separate

**Benefits:**
- More flexibility in IP management
- Can reassociate to different instances
- Avoid accidental IP changes during Terraform updates
- Easier to manage in multi-environment setups

**Trade-off:**
- One extra manual step after Terraform apply
- Need to remember to associate IP

## Security Group Ports

The security group created by Terraform allows:

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Your IP only |
| 80 | HTTP | Public |
| 443 | HTTPS | Public |
| 3000 | Frontend | Public |
| 4000 | Backend | Public |
| 3001 | Grafana | Your IP only |
| 8080 | cAdvisor | Your IP only |
| 8081 | Mongo Express | Your IP only |
| 9090 | Prometheus | Your IP only |
| 27017 | MongoDB | VPC only |

## Updating Infrastructure

```bash
# Make changes to terraform/main.tf
cd terraform

# Preview changes
terraform plan

# Apply changes
terraform apply
```

## Destroying Infrastructure

```bash
cd terraform
terraform destroy
```

**Note**: This will destroy the EC2 instance but NOT the Elastic IP (since it's not managed by Terraform).

## Cost Considerations

| Resource | Cost |
|----------|------|
| EC2 t2.small | ~$17/month |
| EBS 20GB gp3 | ~$2/month |
| Elastic IP (attached) | Free |
| Elastic IP (unattached) | $3.60/month |
| **Total** | **~$19/month** |

**Tip**: Always associate your Elastic IP to avoid charges!

## Troubleshooting

### Can't SSH after Terraform apply?
- Check if Elastic IP is associated
- Verify security group allows your IP
- Check EC2 instance is running

### Terraform shows drift?
- Normal if you associated Elastic IP manually
- Terraform doesn't track manual changes
- Run `terraform refresh` to update state

### Want Terraform to manage Elastic IP?
- Add the `aws_eip_association` resource back
- Run `terraform import` to import existing association
- Then `terraform apply`

---

**Summary**: Terraform creates the EC2 instance and security group. You need to manually associate the Elastic IP and install Docker before deploying your application.
