import { PostModel } from '../models/post.model';
import { IPost } from '../../../types/post-types';

export class PostService {
  static async getAllPosts(): Promise<IPost[]> {
    return PostModel.findAll();
  }

  static async getPostById(id: string): Promise<IPost | null> {
    return PostModel.findById(id);
  }

  static async createPost(postData: Omit<IPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPost> {
    return PostModel.create(postData);
  }

  static async updatePost(id: string, updates: Partial<Omit<IPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<IPost | null> {
    return PostModel.update(id, updates);
  }

  static async deletePost(id: string): Promise<boolean> {
    return PostModel.delete(id);
  }
}
