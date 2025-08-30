import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Round } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export interface RoundWithStats extends Round {
  status: 'COOLDOWN' | 'ACTIVE' | 'COMPLETED';
  timeLeft: number;
  totalTaps: number;
  totalScore: number;
  myScore?: number;
  winner?: {
    username: string;
    score: number;
  } | null;
}

@Injectable()
export class RoundsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createRound(): Promise<Round> {
    const roundDuration =
      this.configService.get<number>('game.roundDuration') || 60000;
    const cooldownDuration =
      this.configService.get<number>('game.cooldownDuration') || 30000;

    const now = new Date();
    const startTime = new Date(now.getTime() + cooldownDuration);
    const endTime = new Date(startTime.getTime() + roundDuration);

    return this.prisma.round.create({
      data: {
        startTime,
        endTime,
      },
    });
  }

  async findAllRounds(): Promise<Round[]> {
    return this.prisma.round.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findRoundById(id: string, userId?: string): Promise<RoundWithStats> {
    const round = await this.prisma.round.findUnique({
      where: { id },
      include: {
        taps: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    const now = new Date();
    const status = this.getRoundStatus(round, now);
    const timeLeft = this.getTimeLeft(round, now, status);

    // Calculate total taps and score
    const totalTaps = round.taps.length;
    const totalScore = round.taps.reduce((sum, tap) => sum + tap.score, 0);

    // Calculate user's score in this round
    let myScore = 0;
    if (userId) {
      const userTaps = round.taps.filter((tap) => tap.userId === userId);
      myScore = userTaps.reduce((sum, tap) => sum + tap.score, 0);
    }

    // Find winner if round is completed
    let winner = null;
    if (status === 'COMPLETED') {
      const userScores = new Map<string, { username: string; score: number }>();

      for (const tap of round.taps) {
        const key = tap.userId;
        if (!userScores.has(key)) {
          userScores.set(key, {
            username: tap.user.username,
            score: 0,
          });
        }
        userScores.get(key)!.score += tap.score;
      }

      if (userScores.size > 0) {
        winner = Array.from(userScores.values()).reduce((max, current) =>
          current.score > max.score ? current : max,
        );
      }
    }

    return {
      ...round,
      status,
      timeLeft,
      totalTaps,
      totalScore,
      myScore,
      winner,
    };
  }

  private getRoundStatus(
    round: Round,
    now: Date,
  ): 'COOLDOWN' | 'ACTIVE' | 'COMPLETED' {
    if (now < round.startTime) {
      return 'COOLDOWN';
    } else if (now >= round.startTime && now <= round.endTime) {
      return 'ACTIVE';
    } else {
      return 'COMPLETED';
    }
  }

  private getTimeLeft(round: Round, now: Date, status: string): number {
    switch (status) {
      case 'COOLDOWN':
        return Math.max(0, round.startTime.getTime() - now.getTime());
      case 'ACTIVE':
        return Math.max(0, round.endTime.getTime() - now.getTime());
      case 'COMPLETED':
        return 0;
      default:
        return 0;
    }
  }

  async handleTap(
    roundId: string,
    userId: string,
  ): Promise<{ score: number; totalScore: number }> {
    return this.prisma.$transaction(async (tx) => {
      // Get round and verify it's active
      const round = await tx.round.findUnique({
        where: { id: roundId },
      });

      if (!round) {
        throw new NotFoundException('Round not found');
      }

      const now = new Date();
      if (now < round.startTime || now > round.endTime) {
        throw new BadRequestException('Round is not active');
      }

      // Get user to check role
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If user is Nikita, don't count taps but return success
      if (user.role === 'NIKITA') {
        return { score: 0, totalScore: 0 };
      }

      // Count user's previous taps in this round
      const userTapsCount = await tx.tap.count({
        where: {
          userId,
          roundId,
        },
      });

      // Calculate score: 1 point normally, 10 points for every 11th tap
      const tapNumber = userTapsCount + 1;
      const score = tapNumber % 11 === 0 ? 10 : 1;

      // Create tap record
      await tx.tap.create({
        data: {
          userId,
          roundId,
          score,
        },
      });

      // Calculate user's total score in this round
      const userTotalScore = await tx.tap.aggregate({
        where: {
          userId,
          roundId,
        },
        _sum: {
          score: true,
        },
      });

      return {
        score,
        totalScore: userTotalScore._sum.score || 0,
      };
    });
  }
}
