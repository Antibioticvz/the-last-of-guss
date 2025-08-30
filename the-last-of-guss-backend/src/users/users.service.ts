import { Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role based on username according to plan
    let role: Role = Role.USER;
    if (username.toLowerCase().includes('admin')) {
      role = Role.ADMIN;
    } else if (username === 'Никита') {
      role = Role.NIKITA;
    }

    return this.prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
        role,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
