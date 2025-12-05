terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  required_version = ">= 1.2"
}

provider "aws" {
  region = "eu-central-1"
}

# ------------------------
# Data sources for existing infrastructure
# ------------------------
data "aws_vpc" "existing" {
  id = "vpc-0f462ce79c9a240c3"
}

data "aws_subnet" "public" {
  id = "subnet-035f3e26f8d4520a8"
}

data "aws_subnet" "private" {
  id = "subnet-0b0172b6b7cc75db0"
}

data "aws_internet_gateway" "existing" {
  filter {
    name   = "attachment.vpc-id"
    values = [data.aws_vpc.existing.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

# ------------------------
# Security Group (use existing)
# ------------------------
data "aws_security_group" "app_sg" {
  name   = "ticket-hub-app-sg"
  vpc_id = data.aws_vpc.existing.id
}

# ------------------------
# Use existing IAM Role
# ------------------------
data "aws_iam_role" "ec2_role" {
  name = "ec2-ssm-role"
}

# ------------------------
# IAM Instance Profile (required for EC2)
# ------------------------
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ssm-profile"
  role = data.aws_iam_role.ec2_role.name
}

# ------------------------
# EC2 Instance
# ------------------------
resource "aws_instance" "app_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t2.micro"
  subnet_id                   = data.aws_subnet.public.id
  vpc_security_group_ids      = [data.aws_security_group.app_sg.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name

  # Password-based SSH (no key)
  user_data = <<-EOF
              #cloud-config
              password: 1234
              chpasswd: { expire: False }
              ssh_pwauth: True
              EOF

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  tags = {
    Name        = "ticket-hub-app-server"
    Environment = "production"
    ManagedBy   = "terraform"
    Application = "ticket-hub"
  }
}

# ------------------------
# Outputs
# ------------------------
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "security_group_id" {
  description = "ID of the security group"
  value       = data.aws_security_group.app_sg.id
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh ubuntu@${aws_instance.app_server.public_ip} (password: 1234)"
}
