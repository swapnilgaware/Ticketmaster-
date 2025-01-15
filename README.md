# Ticketmaster Application

## Overview
The Ticketmaster application is built using the **MEAN stack** (MongoDB, Express, Angular, Node.js) with **Elasticsearch** for advanced search functionality. The application is designed for scalability, modularity, and ease of deployment, leveraging **Docker** for containerization and monitoring tools like **Prometheus** and **Grafana** for observability.

## System Architecture
- **Frontend:** Angular-based dynamic user interface with lazy loading, pagination, and routing.
- **Backend:** Node.js and Express.js API layer for CRUD operations and Elasticsearch integration.
- **Database:** MongoDB with Mongoose ORM for flexible and schema-driven data storage.
- **Search Engine:** Elasticsearch enables fast and scalable full-text search.
- **Monitoring:** Prometheus and Grafana provide centralized monitoring and visualization.
- **Containerization:** Docker ensures consistency, modularity, and simplified deployment.

## Prerequisites
- **Node.js** (version 18.x LTS recommended)
- **Angular CLI** (version 19.0.0 recommended)
- **Docker** (ensure Docker Desktop or similar is installed)
- **MongoDB**, **Elasticsearch**, **Prometheus**, and **Grafana** (handled through Docker)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-repository/ticketmaster.git
cd ticketmaster
```

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   ng serve
   ```

### 3. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd ../backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build and start backend services using Docker:
   ```bash
   docker-compose build
   docker-compose up
   ```

### 4. Access the Application
- **Frontend:** Open your browser and go to `http://localhost:4200`
- **Backend:** API endpoints are available at `http://localhost:5000`

## Key Features
- **Landing Page:** Displays tickets with pagination, sorting, and Elasticsearch-powered search.
- **Ticket Management:** Create and edit tickets with dynamic routing.
- **Monitoring:** Metrics from MongoDB, Elasticsearch, and the host system are visualized via Grafana dashboards.

## Dockerized Services
The following containers are deployed using Docker:
- **App:** Hosts backend APIs for CRUD operations and search.
- **MongoDB:** Stores ticket data.
- **Elasticsearch:** Enables full-text search capabilities.
- **Prometheus:** Collects and stores metrics from all services.
- **Grafana:** Visualizes metrics for monitoring and alerts.

## Monitoring and Observability
- Access Prometheus at `http://localhost:9090`
- Access Grafana at `http://localhost:3000`
  - Default credentials: 
    - Username: `admin`
    - Password: `admin`

## Technologies and Versions
- **Frontend:** Angular 19.0.0
- **Backend:** Node.js 18.x (LTS)
- **Database:** MongoDB 5.0
- **Search Engine:** Elasticsearch 7.17.6
- **Monitoring:** Prometheus 3.1.0, Grafana 11.4.0

## Screenshots
1. **Landing Page:** Displays tickets with pagination and search.
2. **Create/Edit Ticket Pages:** Dynamically create or edit tickets.
3. **Monitoring Dashboard:** Prometheus metrics visualized via Grafana.

## Conclusion
The Ticketmaster application is a robust, scalable system with advanced search capabilities and comprehensive monitoring. Its modular architecture and Dockerized deployment make it suitable for a variety of environments.
