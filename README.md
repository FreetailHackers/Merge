# Merge

Hackathon team formation webapp. Features a real-time chat and swipe feature to find potential teammates.

Contributions welcome!

## Technologies

- [React](https://reactjs.org) and [React Router](https://reacttraining.com/react-router/) for frontend
- [Express](http://expressjs.com/) and [Node](https://nodejs.org/en/) for the backend
- [MongoDB](https://www.mongodb.com/) for the database
- [Mongoose](https://mongoosejs.com), an ODM to represent our mongodb based on our defined schema.
- [Socket.IO](https://socket.io) to enable realtime chat between users
- [Redis](https://redis.io) to allow multiple instances of the chat server to talk to each other, ensuring chat doesn't break when we deploy to prod.

## Installation

- [Redis](https://redis.io/docs/getting-started/installation/)
- [Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)
- [Mongodb Compass](https://www.mongodb.com/try/download/compass) to easily view and manipulate your local database

## Configuration

Utilize the .env.example file, and create two .env's one in your client directory, the other in your
default-service directory. Remember that the client version must be called .env.local.
Ask Adi/Pranay for the AWS credentials.

## Quick Start

You need to also install redis and mongo and start them as a service.On MacOS this is done with brew services
and on Linux it is done with systemctl. You can also use Docker Compose by running the command `docker-compose up -d`
(for Compose v1 & v2) and `docker compose up -d` (for Compose v3) in the root of the project.

```bash
cd default-service
# Install dependencies for server & client
npm install && npm run client-install


# Run client & api server & chat server with concurrently
npm run dev

```
The api server runs on http://localhost:5002, the chat server runs on http://localhost:5003, and client on http://localhost:3000.

## Inspecting Redis:

```bash
# Connect to the redis instance
redis-cli

# Listen into any socket.io messages flowing through the redis instance.
PSUBSCRIBE socket.io*
```
