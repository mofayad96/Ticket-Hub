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
  region  = "eu-central-1"
  
}


data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

# attaching the vpc
data "aws_vpc" "custom" {
  id = "vpc-0f462ce79c9a240c3"
}

# EC2 in public subnet
data "aws_subnet" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.custom.id]
  }

  filter {
    name   = "cidr-block"
    values = ["10.0.1.0/24"]
  }
}
# allow port 80, 22 ssh from my ip
resource "aws_security_group" "app_sg" {
  name        = "app-securityGroup"
  description = "Allow HTTP access on 8080"
  vpc_id      = data.aws_vpc.custom.id

# back-end app access on port 4000
  ingress {
  from_port   = 4000
  to_port     = 4000
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
# ssh port 22 on my device ip
ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["156.211.185.172/32"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# creating EC2 instance
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = data.aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  associate_public_ip_address = false
  key_name               = "mykey" 
  tags = {
    Name = "Ticket-hub-backend"
  }
}

# associate elastic ip
resource "aws_eip_association" "app_eip_assoc" {
  instance_id   = aws_instance.app_server.id
  allocation_id = "eipalloc-0d473fa716949db80"
}