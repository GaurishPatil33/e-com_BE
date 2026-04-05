export interface ICategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    media: {
        url: string;
        public_id: string;
        type: 'image';
    }[];
    parent_id: string | null; 
    is_active: boolean;
    created_at: string; 
    updated_at: string; 
}