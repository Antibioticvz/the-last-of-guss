import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [RoundsController],
  providers: [RoundsService, PrismaService],
  exports: [RoundsService],
})
export class RoundsModule {}