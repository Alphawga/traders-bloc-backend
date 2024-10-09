import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Your API Documentation',
    version: '1.0.0',
    description: 'This is the API documentation for the project.',
  },
  servers: [
    {
      url: 'http://localhost:3000/api', // Change this to the base URL of your API
      description: 'Local server',
    },
  ],
};

// Adjusted the path for the Next.js App Router
const options = {
  swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Specify the paths to your API files
};

export const swaggerSpec = swaggerJsdoc(options);
