we are building a ecommerce application and this will be the backend setup.

src/
│
├── app.ts                # express app
├── server.ts             # server start
│
├── config/
│   ├── db.ts
│   ├── env.ts
│   ├── razorpay.ts
│   └── shiprocket.ts
│
├── models/
│   ├── User.model.ts
│   ├── Product.model.ts
│   ├── Order.model.ts
│   ├── Payment.model.ts
│   └── Shipment.model.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── order.routes.ts
│   ├── payment.routes.ts
│   └── webhook.routes.ts
│
├── controllers/
│   ├── auth.controller.ts
│   ├── product.controller.ts
│   ├── order.controller.ts
│   ├── payment.controller.ts
│   └── webhook.controller.ts
│
├── services/
│   ├── razorpay.service.ts
│   ├── shiprocket.service.ts
│   └── order.service.ts
│
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
│
├── utils/
│   ├── jwt.ts
│   ├── logger.ts
│   └── constants.ts
│
└── types/
    └── express.d.ts
