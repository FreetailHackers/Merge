import { createAuthServer } from './auth';

export function createMockServer () {
  createAuthServer();
}

export function createMockServerIfNotProduction () {
  if ("production" !== process.env.NODE_ENV) {
    createMockServer();
  }
}
