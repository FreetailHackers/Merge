# Merge

Hackathon team formation webapp

## Technologies

- [React](https://reactjs.org) and [React Router](https://reacttraining.com/react-router/) for frontend
- [Express](http://expressjs.com/) and [Node](https://nodejs.org/en/) for the backend
- [MongoDB](https://www.mongodb.com/) for the database
- [Mongoose](https://mongoosejs.com), an ODM to represent our mongodb based on our defined schema.
- [Redux](https://redux.js.org/basics/usagewithreact) for state management between React components
- [Socket.IO](https://socket.io) to enable realtime chat between users
- [Redis](https://redis.io) to allow multiple instances of the chat server to talk to each other, ensuring chat doesn't break when we deploy to prod.

## Installation
- [Redis](https://redis.io/docs/getting-started/installation/)
- [Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)
- [Mongodb Compass](https://www.mongodb.com/try/download/compass) to easily view and manipulate your local database

## Configuration

Utilize the .env.example file, and create two .env's one in your client director, the other in your
default-service directory.
Ask Adi for the AWS credentials.

## Quick Start

```bash
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
