 Description

This repository contains the containerized version of Ticket Hub, a full-stack web application built with React (frontend), Node.js/Express (backend), and MongoDB (database). The app is fully Dockerized using Docker Compose, ensuring reproducibility, portability, and ease of deployment.

Features

Frontend (React + Nginx) → Multi-stage Docker build for optimized production-ready static files.

Backend (Node.js/Express) → REST API handling core business logic and authentication.

MongoDB with Mongo Express → Database persistence with a simple web-based admin dashboard.


creating the vpc and aws networking steps

1-creating the vpc

``` aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region eu-central-1 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=ticket-hub-vpc}]' ```

2-creating public subnet with 10.0.1.0/24 CidrBlock in availability zone:eu-central-1a

``` aws ec2 create-subnet --region eu-central-1 --vpc-id vpc-0f462ce79c9a240c3 --cidr-block 10.0.1.0/24 --availability-zone eu-central-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet}]' ```

3-creating private subnet with 10.0.2.0/24 CidrBlock in availability zone:eu-central-1b

``` aws ec2 create-subnet --region eu-central-1 --vpc-id vpc-0f462ce79c9a240c3 --cidr-block 10.0.2.0/24 --availability-zone eu-central-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet}]' ```

4-creating IGW and attaching it to the VPC 

``` aws ec2 create-internet-gateway --region eu-central-1 --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=th-igw}]' ```

``` aws ec2 attach-internet-gateway --internet-gateway-id igw-08803e257b68e023a --vpc-id vpc-0f462ce79c9a240c3 --region eu-central-1 ```

5-creating NAT inside public subnet
    5.1 allocating address for NAT
    ``` aws ec2 allocate-address --domain vpc --region eu-central-1 ```
    5.2 creating NAT 
    ```aws ec2 create-nat-gateway --subnet-id subnet-035f3e26f8d4520a8 --allocation-id eipalloc-00b56558e01dba038 --region eu-central-1 --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=th-natgw}]'```


6-creating RouteTable and attaching it to the public Subnet 
    6.1- creating Routetable
``` aws ec2 create-route-table --vpc-id vpc-0f462ce79c9a240c3 --region eu-central-1 --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]' ```
    
    6.2- Creating Route to 
    
``` aws ec2 create-route --route-table-id rtb-028331bd680f62ee4 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-08803e257b68e023a --region eu-central-1 ```

    6.3- associate Route-Table to public subnet
``` aws ec2 associate-route-table --subnet-id subnet-035f3e26f8d4520a8 --route-table-id rtb-028331bd680f62ee4 --region eu-central-1 ```

7-creating RouteTable and attaching it to the private subnet
    7.1-creating RouteTable
``` aws ec2 create-route-table --vpc-id vpc-0f462ce79c9a240c3 --region eu-central-1 --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=private-rt}]' ```

   7.2- create Route to the NAT 
``` aws ec2 create-route --route-table-id rtb-03373dd3d04957540 --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-0ed69ba8be2d2d84c --region eu-central-1 ```

    7.3 associate RouteTable to the private subnet 
``` aws ec2 associate-route-table --subnet-id subnet-0b0172b6b7cc75db0 --route-table-id rtb-03373dd3d04957540 --region eu-central-1 ```