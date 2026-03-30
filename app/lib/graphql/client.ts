import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:3001/graphql';

export function createGraphqlClient(headers?: HeadersInit) {
  return new GraphQLClient(endpoint, { headers });
}
