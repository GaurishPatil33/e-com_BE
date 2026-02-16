import { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { IPost } from '../../../types/post-types';

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await postService.findAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting all posts:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await postService.findPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error getting post by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const postData: Omit<IPost, 'id' | 'createdAt' | 'updatedAt'> = req.body;
        const newPost = await postService.createPost(postData);
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const updatedPost = await postService.updatePost(req.params.id, req.body);
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const deleted = await postService.deletePost(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Post not found or could not be deleted' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
