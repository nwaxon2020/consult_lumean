// app/api/news/route.ts
import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'health';
  const pageSize = searchParams.get('pageSize') || '8';

  if (!NEWS_API_KEY) {
    return NextResponse.json(
      { error: 'News API key not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}?country=us&category=${category}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    const data = await response.json();

    if (data.status === 'error') {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch news' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}