import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'contestants.json');
const USER_VOTES_PATH = path.join(process.cwd(), 'data', 'userVotes.json');

type Contestant = {
  id: number;
  name: string;
  image?: string;
  votes: number;
};

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const contestants: Contestant[] = JSON.parse(data);
    return NextResponse.json(contestants);
  } catch {
    return NextResponse.json({ error: 'Failed to load contestants.' }, { status: 500 });
  }
}

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(req: NextRequest) {
  try {
    const { id, email } = await req.json();
    if (typeof id !== 'number') {
      return NextResponse.json({ error: 'Invalid contestant id.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !validateEmail(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Read user votes
    let userVotes: Record<string, { contestantId: number; timestamp: number }> = {};
    try {
      const votesData = await fs.readFile(USER_VOTES_PATH, 'utf-8');
      userVotes = JSON.parse(votesData);
    } catch {
      // File doesn't exist or is empty, continue with empty object
    }

    // Check if user has already voted
    const userVote = userVotes[email];
    if (userVote) {
      return NextResponse.json(
        { error: 'You have already voted in this contest.' },
        { status: 429 }
      );
    }

    // Process the vote
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const contestants: Contestant[] = JSON.parse(data);
    const idx = contestants.findIndex((c: Contestant) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Contestant not found.' }, { status: 404 });
    }
    
    contestants[idx].votes += 1;
    
    // Update user votes
    userVotes[email] = { contestantId: id, timestamp: Date.now() };
    
    // Save both files
    await Promise.all([
      fs.writeFile(DATA_PATH, JSON.stringify(contestants, null, 2)),
      fs.writeFile(USER_VOTES_PATH, JSON.stringify(userVotes, null, 2))
    ]);
    
    return NextResponse.json(contestants);
  } catch {
    return NextResponse.json({ error: 'Failed to submit vote.' }, { status: 500 });
  }
} 