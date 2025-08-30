import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoundsService, RoundWithStats } from './rounds.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    username: string;
    role: Role;
  };
}

@Controller('rounds')
@UseGuards(JwtAuthGuard)
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createRound(@Request() req: AuthenticatedRequest) {
    const round = await this.roundsService.createRound();
    return {
      message: 'Round created successfully',
      round,
    };
  }

  @Get()
  async findAllRounds() {
    const rounds = await this.roundsService.findAllRounds();
    return {
      rounds,
    };
  }

  @Get(':id')
  async findRound(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ round: RoundWithStats }> {
    const userId = req.user?.id;
    const round = await this.roundsService.findRoundById(id, userId);
    return {
      round,
    };
  }

  @Post(':id/tap')
  async tapGuss(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const result = await this.roundsService.handleTap(id, userId);

    return {
      message: 'Tap recorded successfully',
      tapScore: result.score,
      totalScore: result.totalScore,
    };
  }
}
