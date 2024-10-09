// src/app/api/docs/route.ts
import { NextResponse } from 'next/server';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/lib/swaggerConfig';

export const GET = () => {
  // You can add CORS headers or other configurations if needed
  const response = NextResponse.json(swaggerSpec);
  response.headers.set('Content-Type', 'application/json');
  return response;
};

// Serve the Swagger UI
export const swaggerHandler = swaggerUi.setup(swaggerSpec);

// Add a middleware to serve the static HTML page
export const swaggerPage = () => {
    
  return NextResponse.next();
};
