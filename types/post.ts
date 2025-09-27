export type Post = {
    id: string;
    media?: string[];
    description?: string;
    likesCount?: number;
    commentsCount?: number;
    creator?: string;
};

export type Sub = { id: string; title?: string };
