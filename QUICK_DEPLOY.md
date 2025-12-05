# Quick Deployment Reference

## 🚀 Deploy in 5 Steps

### 1. Update Environment
```bash
# Edit backend/.env.production
CLIENT_URL=http://YOUR_EC2_IP:3000
JWT_SECRET=your_secure_secret_here
```

### 2. Apply Terraform
```bash
cd terraform
terraform init
terraform apply
cd ..
```

### 2.5. Associate Elastic IP (Manual)
```bash
# Get instance ID
INSTANCE_ID=$(cd terraform && terraform output -raw instance_id)

# Associate Elastic IP via AWS CLI
aws ec2 associate-address \
  --instance-id $INSTANCE_ID \
  --allocation-id eipalloc-0d473fa716949db80 \
  --region eu-central-1

# Or use AWS Console: EC2 → Elastic IPs → Associate
```

### 3. Wait 5 Minutes
EC2 needs time to install Docker

### 4. Deploy
```bash
./deploy-to-ec2.sh
```

### 5. Access
- Frontend: http://YOUR_EC2_IP:3000
- Backend: http://YOUR_EC2_IP:4000
- Grafana: http://YOUR_EC2_IP:3001

## 📊 Ports Opened

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Your IP only |
| 80 | HTTP | Public |
| 443 | HTTPS | Public |
| 3000 | Frontend | Public |
| 4000 | Backend API | Public |
| 3001 | Grafana | Your IP only |
| 8080 | cAdvisor | Your IP only |
| 8081 | Mongo Express | Your IP only |
| 9090 | Prometheus | Your IP only |
| 27017 | MongoDB | VPC only |

## 🔧 Common Commands

```bash
# SSH into server
ssh -i mykey.pem ubuntu@YOUR_EC2_IP

# View logs
ssh -i mykey.pem ubuntu@YOUR_EC2_IP "cd /home/ubuntu/ticket-hub && docker compose logs -f"

# Restart application
ssh -i mykey.pem ubuntu@YOUR_EC2_IP "cd /home/ubuntu/ticket-hub && docker compose restart"

# Check status
ssh -i mykey.pem ubuntu@YOUR_EC2_IP "cd /home/ubuntu/ticket-hub && docker compose ps"

# Update application
./deploy-to-ec2.sh
```

## 🛑 Stop Everything

```bash
ssh -i mykey.pem ubuntu@YOUR_EC2_IP "cd /home/ubuntu/ticket-hub && docker compose down"
```

## 🗑️ Destroy Infrastructure

```bash
cd terraform
terraform destroy
```

## 📝 Files Created

- `docker-compose.production.yml` - Production compose file
- `terraform/main.tf` - Updated Terraform config
- `deploy-to-ec2.sh` - Deployment script
- `DEPLOYMENT_GUIDE.md` - Complete guide
- `QUICK_DEPLOY.md` - This file

## ⚠️ Important Notes

1. **Change default passwords** in `docker-compose.production.yml`
2. **Update CLIENT_URL** with your EC2 IP
3. **Keep mykey.pem secure** (chmod 400)
4. **Monitor costs** in AWS Console
5. **Set up backups** for production data

## 🔒 Security Checklist

- [ ] Changed MongoDB password
- [ ] Changed Grafana password
- [ ] Changed Mongo Express password
- [ ] Updated JWT_SECRET
- [ ] Restricted SSH to your IP
- [ ] Reviewed security group rules

## 📊 Monitoring

Access Grafana: http://YOUR_EC2_IP:3001
- Username: admin
- Password: admin123
- Import dashboard #1860 for metrics

## 💰 Estimated Cost

~$19/month for t2.small instance

## 🆘 Troubleshooting

**Can't connect?**
- Check security group allows your IP
- Verify EC2 is running
- Check Elastic IP is associated

**Containers not starting?**
```bash
ssh -i mykey.pem ubuntu@YOUR_EC2_IP "docker compose logs"
```

**Need to restart?**
```bash
./deploy-to-ec2.sh
```

---

For detailed information, see **DEPLOYMENT_GUIDE.md**
