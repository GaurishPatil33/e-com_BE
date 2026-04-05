import { PostModel } from '../models/post.model';
import { IPost } from '../../../types/post-types';

export const findAllPosts = async (): Promise<IPost[]> => {
    return await PostModel.findAll();
};

export const findPostById = async (id: string): Promise<IPost | null> => {
    return await PostModel.findById(id);
};

export const createPost = async (postData: Omit<IPost, 'id' | 'created_at' | 'updated_at'>): Promise<IPost> => {
    return await PostModel.create(postData);
};

export const updatePost = async (id: string, updates: Partial<Omit<IPost, 'id' | 'created_at' | 'updated_at'>>): Promise<IPost | null> => {
    return await PostModel.update(id, updates);
};

export const deletePost = async (id: string): Promise<boolean> => {
    return await PostModel.delete(id);
};