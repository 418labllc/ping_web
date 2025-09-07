import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request';
import { getAuthenticatedClient } from '../getAuthenticatedClient';

// Define the GraphQL query
const GET_CATEGORIES = gql`
  query MyQuery {
    categories {
      name
      image
      id
    }
  }
`;


const client = getAuthenticatedClient()

interface Category {
  id: string;
  name: string;
  image: string;
}

// Fetch categories function
const fetchCategories = async (): Promise<Category[]> => {
  const { categories } = await client.request<{ categories: Category[] }>(
    GET_CATEGORIES
  );
  return categories;
};

// Create the custom hook using react-query
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
};
