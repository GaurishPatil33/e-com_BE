import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-commerce Backend API",
            version: "1.0.0",
            description: "API documentation for the E-commerce backend application.",
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1", // Adjust this based on your actual server URL and API base path
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/api/v1/routes/*.ts", "./src/api/v1/models/*.ts"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
