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
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { SignInUserDto } from './dtos/signin-user.dto';
import { TeamService } from '../team/teams.service';
import { CompetitionService } from '../competition/competition.service';
import { EmailGuard } from '../guards/email.guard';


@Controller('user')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private teamService: TeamService,
    private compService: CompetitionService,
  ) {}
  
  @Get()
  async findAllUsers(@Query('email') email: string) {
    return await this.usersService.find(email);
  }
  
  @Get('/auth/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get('/auth/verify-email')
  async verifyEmail(@Query('token') token: string, @Session() session: any) {
    let res  = await this.authService.verifyEmail(token);
    session.emailVerified = true;
    return res;
  }

  @Post('/auth/signout')
  signOut(@Session() session: any) {
    session.userId = null;
    session.emailVerified = null;
  }
  
  @Post('/auth/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password, body.name);
    session.userId = user.id;
    session.emailVerified = user.isEmailVerified;
    return user;
  }
  
  @Post('/auth/signin')
  async signin(@Body() body: SignInUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    session.emailVerified = user.isEmailVerified;
    return user;
  }

  

  @UseGuards(AuthGuard, EmailGuard)
  @Get('/favteam')
  async getFavTeams(@CurrentUser() user: User)
  {
    return this.usersService.getFavTeams(user.id);
  }
  
  @UseGuards(AuthGuard, EmailGuard)
  @Get('/favcomp')
  async getFavComp(@CurrentUser() user: User)
  {
    return this.usersService.getFavComps(user.id);
  }
  
  @UseGuards(AuthGuard, EmailGuard)
  @Post('/favteam/:teamid')
  async addFavTeam(@CurrentUser() user: User, @Param('teamid') teamId: string){
    let team = await this.teamService.findOne(parseInt(teamId));
    if(!team){
      throw new NotFoundException(`Team with id ${teamId} not found`)
    }
    return this.usersService.addFavTeam(user.id, team);
  }
  
  
  @UseGuards(AuthGuard, EmailGuard)
  @Post('/favcomp/:compid')
  async addFavCompetition(@CurrentUser() user: User, @Param('compid') compId: string){
    let competition = await this.compService.findById(parseInt(compId));
    if(!competition){
      throw new NotFoundException(`Competition with id ${compId} not found`)
    }
    return this.usersService.addFavCompetition(user.id, competition);
  }
  
  @UseGuards(AuthGuard, EmailGuard)
  @Delete('/favcomp/:compid')
  async removeFavCompetition(@CurrentUser() user: User, @Param('compid') compId: string){
    return this.usersService.removeFavCompetition(user.id, parseInt(compId));
  }
  
  @UseGuards(AuthGuard, EmailGuard)
  @Delete('/favteam/:teamid')
  async removeFavTeam(@CurrentUser() user: User, @Param('teamid') teamId: string){
    return await this.usersService.removeFavTeam(user.id, parseInt(teamId));
  }
  
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }
  
  // @Delete('/:id')
  // removeUser(@Param('id') id: string) {
  //   return this.usersService.remove(parseInt(id));
  // }
  
  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}

