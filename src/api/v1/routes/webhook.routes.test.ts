import request from 'supertest';
import app from '../../../app';
import * as webhookController from '../controllers/webhook.controller';

jest.mock('../controllers/webhook.controller');

const mockedWebhookController = webhookController as jest.Mocked<typeof webhookController>;

describe('Webhook API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /webhook/razorpay', () => {
        it('should call the razorpayWebhook controller', async () => {
            mockedWebhookController.razorpayWebhook.mockImplementation(async (req, res) => {
                res.status(200).json({ status: 'ok' });
                return Promise.resolve();
            });

            const res = await request(app)
                .post('/webhook/razorpay')
                .send({ event: 'payment.captured', payload: {} });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ status: 'ok' });
            expect(mockedWebhookController.razorpayWebhook).toHaveBeenCalled();
        });
    });
});
