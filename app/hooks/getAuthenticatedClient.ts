
import { auth } from '@/components/firebase/firebaseConfig';
import { GraphQLClient } from 'graphql-request';

// Use environment variable for endpoint
const endpoint = !process.env.PRODUCTION ? process.env.EXPO_PUBLIC_API_URL ?? "https://d3i3a627r0j7in.cloudfront.net/graphql" : 'https://d3i3a627r0j7in.cloudfront.net/graphql';
export const getAuthenticatedClient = async (): Promise<GraphQLClient> => {
  // TODO fix ts err
  const user = auth.currentUser;

  // FIX CARD SAVING and show note for order on orders. also Tab button showing open ordrs at 6  but 1  and notes coming over blank

  if (!user) {
    return new GraphQLClient(endpoint);
  }

  const token = await user.getIdToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return new GraphQLClient(endpoint, { headers });
};
