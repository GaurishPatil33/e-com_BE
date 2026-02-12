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
    parentId: string | null; 
    isActive: boolean;
    createdAt: string; 
    updatedAt: string; 
}