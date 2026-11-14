import { NextResponse } from 'next/server';
import { getRegistryCatalog } from '@/lib/registry';

export const revalidate = false;

export function GET() {
  return NextResponse.json(getRegistryCatalog());
}
