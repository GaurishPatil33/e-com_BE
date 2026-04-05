import { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { IPost } from '../../../types/post-types';

export const getAllPosts = async (req: Request, res: Response) => {
    const posts = await postService.findAllPosts();
    res.status(200).json(posts);
};

export const getPostById = async (req: Request, res: Response) => {
    const post = await postService.findPostById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
};

export const createPost = async (req: Request, res: Response) => {
    const postData: Omit<IPost, 'id' | 'created_at' | 'updated_at'> = req.body;
    const newPost = await postService.createPost(postData);
    res.status(201).json(newPost);
};

export const updatePost = async (req: Request, res: Response) => {
    const updatedPost = await postService.updatePost(req.params.id, req.body);
    if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(updatedPost);
};

export const deletePost = async (req: Request, res: Response) => {
    const deleted = await postService.deletePost(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Post not found or could not be deleted' });
    }
    res.status(204).send();
};
