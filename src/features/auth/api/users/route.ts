import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'users.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const users = JSON.parse(data);
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Failed to load users.' }, { status: 500 });
  }
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email !== 'string' || !validateEmail(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const users: string[] = JSON.parse(data);
    const exists = users.some((e) => e.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ error: 'Email already used.' }, { status: 409 });
    }
    users.push(email);
    await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2));
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Failed to add user.' }, { status: 500 });
  }
} 