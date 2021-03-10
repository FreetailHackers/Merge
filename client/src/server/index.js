import { createServer } from "miragejs";

import { addAuthRoutes } from './auth';
import { addUserRoutes } from './users';

export function createMockServer () {
  createServer({
    routes() {
      addAuthRoutes(this);
      addUserRoutes(this);
    }
  });
}

export function createMockServerIfNotProduction () {
  if ("production" !== process.env.NODE_ENV) {
    createMockServer();
  }
}
