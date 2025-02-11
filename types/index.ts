export interface Blog {
    cover_image: string;
    published_at: string;
    public_reactions_count: number;
    comments_count: number;
    url: string;
    title: string;
    reading_time_minutes: number;
    description: string;
}

export interface Project {
    id: number;
    name: string;
    description: string;
    tools: string[];
    role: string;
    code: string;
    demo: string;
}
