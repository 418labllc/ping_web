import { GraphQLClient } from 'graphql-request';

// TODO: consider moving URL to env config for dev/prod
const endpoint = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export const gqlClient = new GraphQLClient(endpoint, {
  // Optionally attach auth token here via an interceptor per request
  headers: {},
});
