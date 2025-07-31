import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'admins.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const admins = JSON.parse(data);
    return NextResponse.json(admins);
  } catch {
    return NextResponse.json({ error: 'Failed to load admins.' }, { status: 500 });
  }
} 