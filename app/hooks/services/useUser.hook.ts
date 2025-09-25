import { useMutation, useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request';
import { getAuthenticatedClient } from '../getAuthenticatedClient';

const CURRENT_USER_QUERY = gql`
  query currentUser {
    currentUser {
      username
      name
      email
      phone
      signUpCode
      avatarName
      shippingAddress {
        street
        city
        state
        country
      }
      billingAddress {
        street
        city
        state
        country
      }
      role
      createdAt
      updatedAt
    }
  }
`;

// Define the GQL mutation for user creation
const CREATE_USER_MUTATION = gql`
  mutation createUserMutation($email: String, $phone: String) {
    createUser(email: $email, phone: $phone) {
      id
      username
      email
      phone
      role
      avatarName
    }
  }
`;

// Query to fetch user by username
const USER_BY_USERNAME_QUERY = gql`
  query userByUsername($username: String!) {
    userByUsername(username: $username) {
      username
      avatarName
    }
  }
`;

// Hook to create a user using the GraphQL mutation
export const useCreateUser = () => {
  return useMutation({
    mutationFn: async ({ email, phone }: { email?: string; phone?: string }) => {
      const client = await getAuthenticatedClient();
      const variables = { email, phone };
      const data = await client.request(CREATE_USER_MUTATION, variables) as { createUser: any };
      return data.createUser;
    }
  });
};

export const fetchCurrentUser = async () => {
  const client = await getAuthenticatedClient();
  const data = await client.request(CURRENT_USER_QUERY) as { currentUser: any };
  return data.currentUser;
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: false,
  });
};

// Hook to fetch user by username
export const useUserByUsername = (username: string) => {
  return useQuery({
    queryKey: ['userByUsername', username],
    queryFn: async () => {
      const client = await getAuthenticatedClient();
      const data = await client.request(USER_BY_USERNAME_QUERY, { username }) as { userByUsername: any };
      return data.userByUsername;
    },
    enabled: !!username,
  });
};
