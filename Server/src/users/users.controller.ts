import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  NotFoundException,
  Session,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { SignInUserDto } from './dto/signin-user.dto';
import { Response } from 'express';
import { FavouriteService } from './favourite/favourite.service';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private favService: FavouriteService,
    private authService: AuthService,
  ) {}

  @Get()
  @Serialize(UserDto)
  async findAllUsers(@Query('email') email: string) {
    return await this.usersService.find(email);
  }

  @Serialize(UserDto)
  @Get('/auth/bytoken')
  async getUser(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    res.cookie('authToken', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    try {
      const user = await this.authService.getUserFromToken(token);
      return res.json(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Get('/auth/whoami')
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Serialize(UserDto)
  @Get('/auth/verify-email')
  async verifyEmail(@Query('token') token: string, @Session() session: any) {
    let res = await this.authService.verifyEmail(token);
    return res;
  }

  @Serialize(UserDto)
  @Post('/auth/signout')
  signOut(@Res() res: Response) {
    res.clearCookie('authToken', {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });
    return res.send('Signed out!');
  }

  @Serialize(UserDto)
  @Post('/auth/signup')
  async createUser(@Body() body: CreateUserDto, @Res() res: Response) {
    const result = await this.authService.signup(
      body.email,
      body.password,
      body.name,
    );

    const payload = { sub: result.user.id, email: result.user.email };
    const jwtToken = this.authService.generateJwtToken(payload);

    res.cookie('authToken', jwtToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(200).json(result);
  }

  @Serialize(UserDto)
  @Post('/auth/signin')
  async signin(@Body() signinDto: SignInUserDto, @Res() res: Response) {
    try {
      const { accessToken, user } = await this.authService.signin(
        signinDto.email,
        signinDto.password,
      );
      res.cookie('authToken', accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      return res.status(200).json({
        user: {
          id: user.id,
          isEmailVerified: user.isEmailVerified,
          email: user.email,
          name: user.name,
        },
      });
    } catch (e) {
      console.error(e.message);
      if (e instanceof BadRequestException) {
        return res.status(400).json({ message: e.message });
      } else {
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  @UseGuards(AuthGuard)
  @Get('/favteam')
  async getFavTeams(@CurrentUser() user: User) {
    return await this.favService.getFavTeams(user.id);
  }

  @UseGuards(AuthGuard)
  @Get('/favcomp')
  async getFavComp(@CurrentUser() user: User) {
    return await this.favService.getFavComps(user.id);
  }

  @UseGuards(AuthGuard)
  @Post('/favteam/:teamid')
  async addFavTeam(@CurrentUser() user: User, @Param('teamid') teamId: string) {
    try {
      return await this.favService.addFavTeam(user.id, parseInt(teamId));
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Not found team with id ' + teamId);
      }
    }
  }

  @UseGuards(AuthGuard)
  @Post('/favcomp/:compid')
  async addFavCompetition(
    @CurrentUser() user: User,
    @Param('compid') compId: string,
  ) {
    try {
      return await this.favService.addFavComp(user.id, parseInt(compId));
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Not found comp with id ' + compId);
      }
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/favcomp/:compid')
  async removeFavCompetition(
    @CurrentUser() user: User,
    @Param('compid') compId: string,
  ) {
    return await this.favService.removeFavComp(user.id, parseInt(compId));
  }

  @UseGuards(AuthGuard)
  @Delete('/favteam/:teamid')
  async removeFavTeam(
    @CurrentUser() user: User,
    @Param('teamid') teamId: string,
  ) {
    return await this.favService.removeFavTeam(user.id, parseInt(teamId));
  }

  @Get('/:id')
  @Serialize(UserDto)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @Patch('/:id')
  @Serialize(UserDto)
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
