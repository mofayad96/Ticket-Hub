📖 Description

This repository contains the containerized version of Ticket Hub, a full-stack web application built with React (frontend), Node.js/Express (backend), and MongoDB (database). The app is fully Dockerized using Docker Compose, ensuring reproducibility, portability, and ease of deployment.

⚡ Features

🖥️ Frontend (React + Nginx) → Multi-stage Docker build for optimized production-ready static files.

⚙️ Backend (Node.js/Express) → REST API handling core business logic and authentication.

🗄️ MongoDB with Mongo Express → Database persistence with a simple web-based admin dashboard.

🐳 Docker & DevOps Practices:

Multi-stage builds for smaller, secure images.

Service orchestration with Docker Compose.

Internal bridge networking for inter-container communication.

Persistent volumes for MongoDB data durability.

Environment variables managed via .env for security and flexibility.

🚀 Quick Start

Clone the repo and spin up the entire stack with:

git clone https://github.com/your-username/ticket-hub-dockerized.git
cd ticket-hub-dockerized
docker-compose up --build


The following services will be available:

Frontend: http://localhost:5173

Backend API: http://localhost:4000

Mongo Express: http://localhost:8081

👨‍💻 Author

Built & Dockerized by Mohamed Salah Fayad
