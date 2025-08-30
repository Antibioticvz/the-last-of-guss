import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);

    // Set JWT token as HttpOnly cookie for security
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(HttpStatus.CREATED).json({
      message: 'User registered successfully',
      user: result.user,
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    // Set JWT token as HttpOnly cookie for security
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(HttpStatus.OK).json({
      message: 'Login successful',
      user: result.user,
    });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.status(HttpStatus.OK).json({
      message: 'Logout successful',
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
