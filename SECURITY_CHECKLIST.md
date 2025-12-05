# Security Checklist

## 🔒 Files That Should NEVER Be Committed

The following files contain sensitive information and are excluded in `.gitignore`:

### ❌ NEVER Commit These

- [ ] `*.pem` - SSH private keys
- [ ] `*.key` - Any private keys
- [ ] `terraform/*.tfvars` - Contains your IP address
- [ ] `terraform/*.tfstate` - Contains infrastructure details
- [ ] `.env` - Environment variables
- [ ] `backend/.env.production` - Production secrets
- [ ] `.aws/credentials` - AWS credentials

### ✅ Safe to Commit (Examples)

- [x] `terraform/terraform.tfvars.example` - Template file
- [x] `backend/.env.production.example` - Template file
- [x] `terraform/main.tf` - Infrastructure code
- [x] `.gitignore` - Exclusion rules

## 🔍 Check Before Committing

Run these commands before committing:

```bash
# Check for sensitive files
git status

# Check what will be committed
git diff --cached

# Search for potential secrets
git diff --cached | grep -i "password\|secret\|key\|token"
```

## 🛡️ Security Best Practices

### 1. SSH Keys

```bash
# Keep your SSH key secure
chmod 400 mykey.pem

# Never commit SSH keys
# They're already in .gitignore
```

### 2. Environment Variables

```bash
# Use example files as templates
cp backend/.env.production.example backend/.env.production

# Edit with your actual values
nano backend/.env.production

# Verify it's not tracked
git status | grep .env.production
# Should show nothing (file is ignored)
```

### 3. Terraform Variables

```bash
# Use example as template
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Update with your IP
nano terraform/terraform.tfvars

# Verify it's not tracked
git status | grep terraform.tfvars
# Should show nothing (file is ignored)
```

### 4. AWS Credentials

```bash
# Never commit AWS credentials
# Use AWS CLI configuration instead
aws configure

# Credentials stored in ~/.aws/credentials (outside repo)
```

## 🚨 If You Accidentally Commit Secrets

### Immediate Actions

1. **Rotate the compromised credentials immediately**
   ```bash
   # Change passwords
   # Regenerate API keys
   # Create new SSH keys
   ```

2. **Remove from Git history**
   ```bash
   # Remove file from history (use with caution!)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch PATH/TO/FILE" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

3. **Use BFG Repo-Cleaner (easier alternative)**
   ```bash
   # Install BFG
   # https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove sensitive file
   bfg --delete-files FILENAME
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

## 📋 Pre-Commit Checklist

Before every commit:

- [ ] Run `git status` to check what's being committed
- [ ] Verify no `.env` files are staged
- [ ] Verify no `.tfvars` files are staged
- [ ] Verify no `.pem` or `.key` files are staged
- [ ] Check for hardcoded passwords or secrets
- [ ] Review `git diff --cached` output

## 🔐 Recommended Tools

### 1. git-secrets

Prevents committing secrets:

```bash
# Install
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Ubuntu

# Set up
cd your-repo
git secrets --install
git secrets --register-aws
```

### 2. pre-commit hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check for common secret patterns
if git diff --cached | grep -E "password|secret|key|token" | grep -v "example"; then
    echo "⚠️  Warning: Potential secret detected!"
    echo "Review your changes carefully."
    exit 1
fi
```

### 3. GitHub Secret Scanning

Enable in repository settings:
- Settings → Security → Secret scanning

## 📝 What's in .gitignore

Current exclusions:

```
# Sensitive files
*.pem, *.key          # SSH keys
*.tfvars              # Terraform variables
*.tfstate             # Terraform state
.env, *.env           # Environment variables

# Data directories
mongo-backup/         # Database backups
monitoring/*/data/    # Monitoring data

# Dependencies
node_modules/         # Node packages

# IDE files
.vscode/, .idea/      # Editor configs

# OS files
.DS_Store, Thumbs.db  # System files
```

## 🎯 Quick Security Audit

Run this to check for potential issues:

```bash
# Check for tracked sensitive files
git ls-files | grep -E "\.pem$|\.key$|\.tfvars$|\.env$"

# Should return nothing. If it shows files, they need to be removed!

# Check for secrets in code
grep -r "password\|secret\|key" --include="*.js" --include="*.tf" .

# Review any matches carefully
```

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git-secrets tool](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

## ✅ Current Status

Your repository is configured with:

- ✅ Comprehensive `.gitignore`
- ✅ Example files for sensitive configs
- ✅ Terraform state excluded
- ✅ Environment variables excluded
- ✅ SSH keys excluded

## 🔄 Regular Maintenance

Monthly checklist:

- [ ] Review `.gitignore` for new patterns
- [ ] Rotate production passwords
- [ ] Update SSH keys if needed
- [ ] Review AWS IAM permissions
- [ ] Check for exposed secrets in commits

---

**Remember**: It's easier to prevent secrets from being committed than to remove them after the fact!
