// Simulated paginated feed API
// Each page returns deterministic fake posts based on page (cursor) and pageSize.
// Cursor is numeric (starting at 0). Returns { items, nextCursor, hasMore }.

export interface SimFeedItem {
    id: string;
    uri: string;
    description: string;
    likesCount: number;
    commentsCount: number;
    liked: boolean;
    creator: string;
    category: string;
    media: string[];
}

export interface SimFeedPageResult {
    items: SimFeedItem[];
    nextCursor: number | null;
    hasMore: boolean;
}

const VIDEO_A = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
const VIDEO_B = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';
const CATEGORIES = ['s/RealEstate', 's/Home', 's/Auto', 's/Electronics', 's/Food'];

function makeItem(globalIndex: number): SimFeedItem {
    const useA = globalIndex % 2 === 0;
    const uri = useA ? VIDEO_A : VIDEO_B;
    const category = CATEGORIES[globalIndex % CATEGORIES.length];
    return {
        id: `pg_${globalIndex}`,
        uri,
        media: [uri],
        description: `Fake API Feed post #${globalIndex}`,
        likesCount: (globalIndex * 13) % 500,
        commentsCount: (globalIndex * 7) % 120,
        liked: false,
        creator: `agent_${globalIndex % 10}`,
        category,
    };
}

export async function fetchFeedPage(cursor: number | null, pageSize: number): Promise<SimFeedPageResult> {
    // simulate network latency
    await new Promise((r) => setTimeout(r, 250));
    const start = cursor ?? 0;
    const items: SimFeedItem[] = [];
    for (let i = 0; i < pageSize; i++) {
        const globalIndex = start + i;
        // Hard cap simulation (e.g., 2000 items). Adjust as needed.
        if (globalIndex >= 2000) break;
        items.push(makeItem(globalIndex));
    }
    const lastIndex = start + items.length - 1;
    const hasMore = lastIndex < 1999;
    return {
        items,
        hasMore,
        nextCursor: hasMore ? lastIndex + 1 : null,
    };
}
