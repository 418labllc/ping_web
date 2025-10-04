import { useInfiniteQuery, QueryClient } from '@tanstack/react-query';
import { fetchFeedPage, SimFeedItem } from '../lib/fetchFeedPage';

export const FEED_PAGE_SIZE = 20;

export interface UseInfiniteFeedOptions {
    pageSize?: number;
    enabled?: boolean;
    categoryFilter?: string | null;
    discoverCreators?: string[] | null;
}

interface PageData { items: SimFeedItem[]; nextCursor: number | null; hasMore: boolean; }

export function useInfiniteFeed(opts: UseInfiniteFeedOptions = {}) {
    const { pageSize = FEED_PAGE_SIZE, enabled = true } = opts;
    // For now filtering (category/discover) will be applied client-side after flatten.
    const query = useInfiniteQuery<PageData, Error>({
        queryKey: ['feed', pageSize],
        enabled,
        queryFn: async ({ pageParam }) => fetchFeedPage(typeof pageParam === 'number' ? pageParam : null, pageSize),
        initialPageParam: null as number | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 15_000,
    });

    const flat = query.data?.pages.flatMap(p => p.items) ?? [];
    return {
        ...query,
        items: flat,
        hasMore: query.data?.pages.at(-1)?.hasMore ?? true,
    };
}
