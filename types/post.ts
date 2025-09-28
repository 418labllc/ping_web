export type Post = {
    id: string;
    media?: string[];
    description?: string;
    likesCount?: number;
    commentsCount?: number;
    creator?: string;
    // local client state
    liked?: boolean;
};

export type Sub = { id: string; title?: string };
