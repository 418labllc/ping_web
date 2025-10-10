import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPostsPage } from '../services/posts';

export const FEED_PAGE_SIZE = 20;

export interface UseInfiniteFeedOptions {
    pageSize?: number;
    enabled?: boolean;
    categoryFilter?: string | null;
    discoverCreators?: string[] | null;
}

interface PageData { items: any[]; endCursor: string | null; hasMore: boolean; }

export function useInfiniteFeed(opts: UseInfiniteFeedOptions = {}) {
    const { pageSize = FEED_PAGE_SIZE, enabled = true } = opts;
    // For now filtering (category/discover) will be applied client-side after flatten.
    const query = useInfiniteQuery<PageData, Error>({
        queryKey: ['feed', pageSize],
        enabled,
        queryFn: async ({ pageParam }) => {
            const after = typeof pageParam === 'string' ? pageParam : null;
            const posts = await fetchPostsPage({ after, limit: pageSize });
            const mapped = posts.map((p: any) => ({
                id: p.id,
                uri: p.uri,
                media: p.uri ? [p.uri] : [],
                description: p.description ?? '',
                heartsCount: p.heartsCount ?? 0,
                commentsCount: 0,
                liked: false,
                creator: typeof p.creator === 'string' ? p.creator : p?.creator?.id ?? '',
                createdAt: p.createdAt,
            }));
            const endCursor = mapped.length ? mapped[mapped.length - 1].id : null;
            return { items: mapped, endCursor, hasMore: mapped.length >= pageSize };
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.endCursor : null,
        staleTime: 15_000,
    });

    const flat = query.data?.pages.flatMap(p => p.items) ?? [];
    return {
        ...query,
        items: flat,
        hasMore: query.data?.pages.at(-1)?.hasMore ?? true,
    };
}
