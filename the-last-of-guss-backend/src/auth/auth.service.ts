import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

export interface AuthResult {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const { username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Create new user
    const user = await this.usersService.create(username, password);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash as string,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.usersService.findById(payload.sub);
  }
}
