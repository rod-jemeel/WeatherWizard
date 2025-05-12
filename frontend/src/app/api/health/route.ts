import { NextResponse } from 'next/server';
import { validateEnv } from '@/utils/env';

export async function GET() {
  try {
    // Check environment variables
    const envValid = validateEnv();
    
    // Basic health check response
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envValid,
    };
    
    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
