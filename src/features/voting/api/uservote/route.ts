import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USER_VOTES_PATH = path.join(process.cwd(), 'data', 'userVotes.json');

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    let userVotes: Record<string, { contestantId: number; timestamp: number }> = {};
    
    try {
      const votesData = await fs.readFile(USER_VOTES_PATH, 'utf-8');
      userVotes = JSON.parse(votesData);
    } catch {
      // File doesn't exist or is empty
      return NextResponse.json({ hasVoted: false });
    }

    const userVote = userVotes[email];
    
    if (!userVote) {
      return NextResponse.json({ hasVoted: false });
    }

    // User has already voted - return their vote
    return NextResponse.json({
      hasVoted: true,
      contestantId: userVote.contestantId,
      timestamp: userVote.timestamp,
      canVoteAgain: false
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get vote data' }, { status: 500 });
  }
}