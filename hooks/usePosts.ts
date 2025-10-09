import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchPostsPage } from '../services/posts';

export const POSTS_PAGE_SIZE = 20;

export interface UsePostsOptions {
    pageSize?: number;
    enabled?: boolean;
    filter?: any;
}

interface PageData { items: any[]; endCursor: string | null; hasMore: boolean; }

export function usePosts(opts: UsePostsOptions = {}) {
    const { pageSize = POSTS_PAGE_SIZE, enabled = true, filter } = opts;
    const query = useInfiniteQuery<PageData, Error>({
        queryKey: ['posts', pageSize, filter ?? null],
        enabled,
        queryFn: async ({ pageParam }) => {
            const after = typeof pageParam === 'string' ? pageParam : null;
            const posts = await fetchPostsPage({ after, limit: pageSize, filter });
            const mapped = posts.map((p: any) => ({
                id: p.id,
                uri: p.uri,
                media: p.uri ? [p.uri] : [],
                description: p.description ?? '',
                likesCount: p.heartsCount ?? 0,
                commentsCount: 0,
                liked: false,
                creator: typeof p.creator === 'string' ? p.creator : p?.creator?.id ?? '',
                createdAt: p.createdAt,
            }));
            const endCursor = mapped.length ? mapped[mapped.length - 1].id : null;
            return { items: mapped, endCursor, hasMore: mapped.length >= pageSize };
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.endCursor : null),
                staleTime: 15_000,
    });

            // Dev-only logging for network/page results
            useEffect(() => {
                if (!__DEV__) return;
                const pages = query.data?.pages ?? [];
                if (!pages.length) return;
                const last = pages[pages.length - 1];
                console.log('[RQ][usePosts][data]', {
                    pages: pages.length,
                    lastCount: last?.items?.length ?? 0,
                    endCursor: last?.endCursor ?? null,
                    hasMore: last?.hasMore ?? false,
                });
            }, [query.data]);

            useEffect(() => {
                if (__DEV__ && query.error) {
                    console.warn('[RQ][usePosts][error]', String(query.error));
                }
            }, [query.error]);

    const flat = query.data?.pages.flatMap((p) => p.items) ?? [];
    return {
        ...query,
        items: flat,
        hasMore: query.data?.pages.at(-1)?.hasMore ?? true,
    };
}
