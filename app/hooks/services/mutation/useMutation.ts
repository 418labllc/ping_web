import { useMutation } from '@tanstack/react-query'
import type { gql } from 'graphql-request';
import { getAuthenticatedClient } from '../../getAuthenticatedClient';

interface UseGraphQLMutationProps {
  query: ReturnType<typeof gql>;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// Custom hook for GraphQL mutations
export const useGraphQLMutation = ({
  query,
  onSuccess,
  onError,
}: UseGraphQLMutationProps) => {
  return useMutation(
    async (variables: Record<string, any>) => {
      // Get the authenticated GraphQL client
      const client = await getAuthenticatedClient();

      // Perform the mutation
      return client.request(query, variables);
    },
    {
      onSuccess,
      onError,
    }
  );
};
