# Secure File Transfer Project

## Overview

This project is a secure file transfer system that allows users to upload, download and share. The system includes a frontend for user interaction and a backend for handling file operations and security.

## Features

- [x] User authentication and authorization
- [ ] MFA
- [ ] RBAC
- [x] Encrypted file storage
- [x] Secure file sharing
- [ ] Deletion of file

## Getting Started

### Prerequisites

Make sure you have the following installed on your local development machine:

- Docker
- Docker Compose

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Madhukar525722/secure-file-transfer.git
    cd secure-file-transfer
    ```

2. Build and launch the project using Docker Compose:

    ```bash
    docker compose up --build
    ```

### Accessing the Application

- Frontend: [http://localhost:3000/](http://localhost:3000/)
- Backend: [http://localhost:8000/](http://localhost:8000/)

### **BUG**
- **Currently functionality will only work for username: user and password: user**

