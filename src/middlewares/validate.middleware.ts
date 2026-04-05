import { Request, Response, NextFunction } from 'express';
import { validationResult, checkSchema, Schema } from 'express-validator';

// Middleware to validate request data based on a schema
export const validate = (schema: Schema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(checkSchema(schema).map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};

// Example schemas (these would typically be in a separate validation/schemas directory)
export const registerUserSchema: Schema = {
    first_name: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'First name is required',
        },
        isString: {
            errorMessage: 'First name must be a string',
        },
    },
    last_name: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Last name is required',
        },
        isString: {
            errorMessage: 'Last name must be a string',
        },
    },
    email: {
        in: ['body'],
        isEmail: {
            errorMessage: 'Valid email is required',
        },
    },
    phone: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Phone number is required',
        },
        isString: {
            errorMessage: 'Phone number must be a string',
        },
    },
    password: {
        in: ['body'],
        isLength: {
            options: { min: 6 },
            errorMessage: 'Password must be at least 6 characters long',
        },
    },
};

export const loginUserSchema: Schema = {
    email: {
        in: ['body'],
        isEmail: {
            errorMessage: 'Valid email is required',
        },
    },
    password: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Password is required',
        },
    },
};
