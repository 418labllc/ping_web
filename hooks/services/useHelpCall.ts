import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request';
import { getAuthenticatedClient } from '../getAuthenticatedClient';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export const selectCurrentUser = (state: RootState) => state.auth.currentUser;

//
// GraphQL Schema for Help Calls
//

// Retrieve all help calls based on optional filters.
const GET_HELP_CALLS = gql`
  query GetHelpCalls($where: HelpCallFilterInput) {
    helpCalls(where: $where) {
      id
      table {
        id
        tableNumber
        shortid
      }
      user {
        id
        username
        name
      }
      description
      status
      createdAt
      updatedAt
    }
  }
`;

// Retrieve a single help call by its ID.
const GET_HELP_CALL_BY_ID = gql`
  query GetHelpCall($id: ID!) {
    helpCall(id: $id) {
      id
      tableId
      description
      status
      createdAt
      updatedAt
    }
  }
`;

// Create a new help call.
const CREATE_HELP_CALL = gql`
  mutation CreateHelpCall($input: CreateHelpCallInput!) {
    createHelpCall(input: $input) {
      id
      tableId
      description
      status
      createdAt
      updatedAt
    }
  }
`;

// Update the status of an existing help call.
const UPDATE_HELP_CALL_STATUS = gql`
  mutation UpdateHelpCallStatus($input: UpdateHelpCallStatusInput!) {
    updateHelpCallStatus(input: $input) {
      id
      status
      updatedAt
    }
  }
`;

// Cancel an existing help call.
const CANCEL_HELP_CALL = gql`
  mutation CancelHelpCall($id: ID!) {
    cancelHelpCall(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

// Update the status of multiple help calls at once.
const UPDATE_MANY_HELP_CALL_STATUS = gql`
  mutation UpdateManyHelpCallStatus($ids: [ID!]!, $status: HelpCallStatus!) {
    updateManyHelpCallStatus(ids: $ids, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

//
// Functions that use the authenticated client to perform GraphQL requests
//

// Accepts an optional filter object (e.g., { tableId, status })
const fetchHelpCalls = async (filter?: {
  tableId?: string;
  status?: string;
}) => {
  const client = await getAuthenticatedClient();
  const variables = { where: filter || {} };
  const data: any = await client.request(GET_HELP_CALLS, variables);
  return data.helpCalls;
};

const fetchHelpCallById = async (id: string) => {
  const client = await getAuthenticatedClient();
  const variables = { id };
  const data: any = await client.request(GET_HELP_CALL_BY_ID, variables);
  return data.helpCall;
};

const createHelpCall = async (input: {
  tableId: string;
  description: string;
}) => {
  const client = await getAuthenticatedClient();
  const variables = { input };
  const data: any = await client.request(CREATE_HELP_CALL, variables);
  return data.createHelpCall;
};

const updateHelpCallStatus = async (input: {
  id: string;
  status: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CANCELLED';
}) => {
  const client = await getAuthenticatedClient();
  const variables = { input };
  const data: any = await client.request(UPDATE_HELP_CALL_STATUS, variables);
  return data.updateHelpCallStatus;
};

const cancelHelpCall = async (id: string) => {
  const client = await getAuthenticatedClient();
  const variables = { id };
  const data: any = await client.request(CANCEL_HELP_CALL, variables);
  return data.cancelHelpCall;
};

const updateManyHelpCallStatus = async (ids: string[], status: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CANCELLED') => {
  const client = await getAuthenticatedClient();
  const variables = { ids, status };
  const data: any = await client.request(UPDATE_MANY_HELP_CALL_STATUS, variables);
  return data.updateManyHelpCallStatus;
};

//
// React Query Hooks for Help Calls
//

// Accepts a filter object (e.g., { tableId, status })
export const useHelpCalls = (filters?: { tableId?: string; status?: string }) => {
  const currentUser = useSelector(selectCurrentUser);
  const enabled = !!currentUser && !!filters && Object.keys(filters).length > 0;
  return useQuery({
    queryKey: ['helpCalls', filters],
    queryFn: () => fetchHelpCalls(filters),
    enabled,
    placeholderData: [],
  });
};

export const useHelpCallById = (id: string) => {
  return useQuery({
    queryKey: ['helpCall', id],
    queryFn: () => fetchHelpCallById(id),
    enabled: !!id,
  });
};

export const useCreateHelpCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { tableId: string; description: string }) => createHelpCall(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpCalls'] });
    },
  });
};

export const useUpdateHelpCallStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      status: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CANCELLED';
    }) => updateHelpCallStatus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpCalls'] });
    },
  });
};

export const useCancelHelpCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelHelpCall(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpCalls'] });
    },
  });
};

export const useUpdateManyHelpCallStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CANCELLED' }) => updateManyHelpCallStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpCalls'] });
    },
  });
};
