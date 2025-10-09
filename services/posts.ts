import { gql } from 'graphql-request';
import { gqlClient } from './gqlClient';

export type GqlPost = {
  id: string;
  uri: string;
  description?: string | null;
  heartsCount: number;
  createdAt: string;
  creator: { id: string; username?: string | null } | string; // server currently returns creator as ID string in feed types
};

export type PostsResponse = GqlPost[];

const POSTS_QUERY = gql/* GraphQL */`
  query Posts($after: ID, $limit: Int, $filter: PostFilterInput) {
    posts(after: $after, limit: $limit, filter: $filter) {
      id
      uri
      description
      heartsCount
      createdAt
      creator { id username }
    }
  }
`;

let __reqCounter = 0;
export async function fetchPostsPage(params: { after?: string | null; limit?: number; filter?: any }) {
  const { after, limit = 20, filter } = params;
  const reqId = ++__reqCounter;
  const started = Date.now();
  try {
    const data = await gqlClient.request<{ posts: PostsResponse }>(POSTS_QUERY, { after, limit, filter });
    if (__DEV__) {
      const posts = data.posts ?? [];
      const took = Date.now() - started;
      const firstId = posts[0]?.id;
      const lastId = posts[posts.length - 1]?.id;
      // Minimal, structured debug info
      console.log('[GQL][posts]', { reqId, after, limit, count: posts.length, firstId, lastId, tookMs: took });
    }
    return data.posts;
  } catch (err) {
    if (__DEV__) {
      const took = Date.now() - started;
      console.warn('[GQL][posts][error]', { reqId, after, limit, tookMs: took, err: String(err) });
    }
    throw err;
  }
}
