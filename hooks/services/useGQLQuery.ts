import { useQuery } from '@tanstack/react-query'
import type { gql } from 'graphql-request';
import { getAuthenticatedClient } from '../getAuthenticatedClient';

export const useGQLQuery = (
  key: string,
  query: ReturnType<typeof gql>,
  variables?: Record<string, any>
) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [key, variables],
    queryFn: async () => {
      // Get the authenticated GraphQL client
      const client = await getAuthenticatedClient();
      // Make the request with the client
      const response = await client.request(query, variables);
      return response;
    },
  });

  return { data, error, isLoading, refetch };
};
