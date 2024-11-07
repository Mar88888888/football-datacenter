import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { IAuthService } from './auth.service.interface';
import { IUsersService } from './users.service.interface';
import { IMailService } from '../mail/mail.service.interface';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService implements IAuthService{
  constructor(
    @Inject('IUsersService') private usersService: IUsersService,
    @Inject('IMailService') private mailService: IMailService,
    private jwtService: JwtService,
  ) {}  

  async signup(email: string, password: string, name:string) {
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');

    const user = await this.usersService.create(email, result, name);

    const verificationToken = uuidv4();
    await this.usersService.saveVerificationToken(user.id, verificationToken);
    await this.mailService.sendVerificationEmail(user.email, verificationToken, user);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { user, accessToken };
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { accessToken, user };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }
    user.isEmailVerified = true;
    await this.usersService.update(user.id, user);
    return { message: 'Email verified successfully' };
  }

  public generateJwtToken(payload: { sub: number; email: string }): string {
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

   async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
