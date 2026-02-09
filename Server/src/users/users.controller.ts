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
  UseGuards,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { SignInUserDto } from './dto/signin-user.dto';
import { FavouriteService } from './favourite/favourite.service';
import { HiddenService } from './hidden/hidden.service';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private favService: FavouriteService,
    private hiddenService: HiddenService,
    private authService: AuthService,
  ) {}

  @Get()
  @Serialize(UserDto)
  async findAllUsers(@Query('email') email: string) {
    return await this.usersService.find(email);
  }

  @Serialize(UserDto)
  @Get('/auth/bytoken')
  async getUser(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const user = await this.authService.getUserFromToken(token);
      return user;
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

  @Post('/auth/signout')
  signOut() {
    return { message: 'Signed out successfully' };
  }

  @Serialize(UserDto)
  @Post('/auth/signup')
  @UseGuards(ThrottlerGuard)
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  async createUser(@Body() body: CreateUserDto) {
    const result = await this.authService.signup(
      body.email,
      body.password,
      body.name,
    );

    const payload = { sub: result.user.id, email: result.user.email };
    const accessToken = this.authService.generateJwtToken(payload);

    return { ...result, accessToken };
  }

  @Serialize(UserDto)
  @Post('/auth/signin')
  @UseGuards(ThrottlerGuard)
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  async signin(@Body() signinDto: SignInUserDto) {
    const { accessToken, user } = await this.authService.signin(
      signinDto.email,
      signinDto.password,
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
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
      await this.favService.addFavTeam(user.id, parseInt(teamId));
      return { success: true };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Not found team with id ' + teamId);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Post('/favcomp/:compid')
  async addFavCompetition(
    @CurrentUser() user: User,
    @Param('compid') compId: string,
  ) {
    try {
      await this.favService.addFavComp(user.id, parseInt(compId));
      return { success: true };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Not found comp with id ' + compId);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/favcomp/:compid')
  @HttpCode(204)
  async removeFavCompetition(
    @CurrentUser() user: User,
    @Param('compid') compId: string,
  ) {
    return await this.favService.removeFavComp(user.id, parseInt(compId));
  }

  @UseGuards(AuthGuard)
  @Delete('/favteam/:teamid')
  @HttpCode(204)
  async removeFavTeam(
    @CurrentUser() user: User,
    @Param('teamid') teamId: string,
  ) {
    return await this.favService.removeFavTeam(user.id, parseInt(teamId));
  }

  // Hidden competitions endpoints
  @UseGuards(AuthGuard)
  @Get('/hiddencomp')
  async getHiddenComps(@CurrentUser() user: User) {
    return await this.hiddenService.getHiddenComps(user.id);
  }

  @UseGuards(AuthGuard)
  @Post('/hiddencomp/:compid')
  async hideCompetition(
    @CurrentUser() user: User,
    @Param('compid') compId: string,
  ) {
    try {
      await this.hiddenService.hideComp(user.id, parseInt(compId));
      return { success: true };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Not found competition with id ' + compId);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/hiddencomp/:compid')
  @HttpCode(204)
  async showCompetition(
    @CurrentUser() user: User,
    @Param('compid') compId: string,
  ) {
    return await this.hiddenService.showComp(user.id, parseInt(compId));
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
