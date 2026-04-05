import request from 'supertest';
import app from '../../../app';
import * as postService from '../services/post.service';
import * as authService from '../services/auth.service';
import { IPost } from '../../../types/post-types';
import { IUser } from '../../../types/user-types';

// Mock the post service
jest.mock('../services/post.service');
// Mock the auth service
jest.mock('../services/auth.service');

const mockedPostService = postService as jest.Mocked<typeof postService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Post API', () => {
  let adminUser: IUser;
  let customerUser: IUser; // Not used for posts, but kept for consistency
  let adminToken: string;
  let customerToken: string; // Not used for posts, but kept for consistency

  beforeAll(() => {
    adminUser = {
      id: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      phone: '1112223333',
      password: 'hashedpassword', // Made optional in IUser, but tests might still provide it
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customerUser = {
      id: 'customer123',
      first_name: 'Customer',
      last_name: 'User',
      email: 'customer@example.com',
      phone: '4445556666',
      password: 'hashedpassword', // Made optional in IUser, but tests might still provide it
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    adminToken = 'mock-admin-token';
    customerToken = 'mock-customer-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for authentication
    mockedAuthService.verifyAuthToken.mockImplementation((token: string) => {
      if (token === adminToken) return { id: adminUser.id };
      if (token === customerToken) return { id: customerUser.id };
      return null;
    });
    mockedAuthService.findUserById.mockImplementation((id: string) => {
      if (id === adminUser.id) return Promise.resolve(adminUser);
      if (id === customerUser.id) return Promise.resolve(customerUser);
      return Promise.resolve(null);
    });
  });

  describe('GET /api/v1/posts', () => {
    it('should return all posts', async () => {
      const mockPosts: IPost[] = [
        {
          id: 'post1',
          title: 'First Post',
          content: 'This is the content of the first post.',
          author_id: adminUser.id, // Added author_id
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      mockedPostService.findAllPosts.mockResolvedValue(mockPosts);

      const res = await request(app).get('/api/v1/posts');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPosts);
      expect(mockedPostService.findAllPosts).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a server error', async () => {
      mockedPostService.findAllPosts.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/posts');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('POST /api/v1/posts', () => {
    it('should create a new post for an admin user', async () => {
      const newPostInput = {
        title: 'New Post Title',
        content: 'This is the content of the new post.',
      };
      const createdPost: IPost = {
        id: 'post2',
        author_id: adminUser.id, // Added author_id
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newPostInput,
      };
      mockedPostService.createPost.mockResolvedValue(createdPost);

      const res = await request(app)
        .post('/api/v1/posts')
        .set('Cookie', [`token=${adminToken}`])
        .send(newPostInput);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdPost);
      expect(mockedPostService.createPost).toHaveBeenCalledWith(expect.objectContaining(newPostInput));
    });

    it('should return 401 if not authenticated', async () => {
      const newPostInput = {
        title: 'New Post Title',
        content: 'This is the content of the new post.',
      };
      const res = await request(app)
        .post('/api/v1/posts')
        .send(newPostInput);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      const newPostInput = {
        title: 'New Post Title',
        content: 'This is the content of the new post.',
      };
      mockedPostService.createPost.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/v1/posts')
        .set('Cookie', [`token=${adminToken}`])
        .send(newPostInput);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    it('should return a post by ID', async () => {
      const mockPost: IPost = {
        id: 'post3',
          title: 'Third Post',
          content: 'Content of the third post.',
          author_id: adminUser.id, // Added author_id
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
      };
      mockedPostService.findPostById.mockResolvedValue(mockPost);

      const res = await request(app).get(`/api/v1/posts/${mockPost.id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPost);
      expect(mockedPostService.findPostById).toHaveBeenCalledWith(mockPost.id);
    });

    it('should return 404 if post not found', async () => {
      mockedPostService.findPostById.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/posts/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Post not found' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedPostService.findPostById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/v1/posts/someid');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('PUT /api/v1/posts/:id', () => {
    it('should update a post by ID for an admin user', async () => {
      const postId = 'postToUpdate';
      const updateData = { title: 'Updated Title', content: 'Updated content.' };
      const updatedPost: IPost = {
        id: postId,
        author_id: adminUser.id, // Added author_id
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updateData,
      };
      mockedPostService.updatePost.mockResolvedValue(updatedPost);

      const res = await request(app)
        .put(`/api/v1/posts/${postId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedPost);
      expect(mockedPostService.updatePost).toHaveBeenCalledWith(postId, updateData);
    });

    it('should return 404 if post to update not found', async () => {
      mockedPostService.updatePost.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/v1/posts/nonexistent')
        .set('Cookie', [`token=${adminToken}`])
        .send({ title: 'New Title' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Post not found' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/posts/someid')
        .send({ title: 'New Title' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedPostService.updatePost.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/v1/posts/someid')
        .set('Cookie', [`token=${adminToken}`])
        .send({ title: 'New Title' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    it('should delete a post by ID for an admin user', async () => {
      const postId = 'postToDelete';
      mockedPostService.deletePost.mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(mockedPostService.deletePost).toHaveBeenCalledWith(postId);
    });

    it('should return 404 if post to delete not found', async () => {
      mockedPostService.deletePost.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/v1/posts/nonexistent')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: 'Post not found or could not be deleted' });
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete('/api/v1/posts/someid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ message: 'No token, authorization denied' });
    });

    it('should return 500 if there is a server error', async () => {
      mockedPostService.deletePost.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/v1/posts/someid')
        .set('Cookie', [`token=${adminToken}`]);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: 'Database error', stack: expect.any(String) });
    });
  });
});
