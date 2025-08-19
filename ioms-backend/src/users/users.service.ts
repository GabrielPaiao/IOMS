// src/users/users.service.ts
import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;
  private readonly INVITATION_EXPIRATION_HOURS = 24;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createUser(createUserDto: CreateUserDto, companyId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);
    
    try {
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          companyId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async inviteUser(inviteUserDto: InviteUserDto, companyId: string, inviterId: string) {
    await this.validateAdminInviter(inviterId, companyId);
    await this.validateEmailNotRegistered(inviteUserDto.email);

    const { token, expiration } = this.generateInvitationToken();
    
    try {
      const invitation = await this.prisma.invitation.create({
        data: {
          email: inviteUserDto.email,
          role: inviteUserDto.role,
          token,
          expiresAt: expiration,
          companyId,
        }
      });

      await this.sendInvitationEmail(inviteUserDto, token);

      return { 
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
        expiresAt: invitation.expiresAt
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send invitation');
    }
  }

  async registerWithToken(token: string, createUserDto: CreateUserDto) {
    const invitation = await this.validateInvitationToken(token, createUserDto.email);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          password: await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS),
          role: invitation.role,
          companyId: invitation.companyId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
        }
      });

      await tx.invitation.delete({ where: { id: invitation.id } });

      return user;
    });
  }

  async getCompanyUsers(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Métodos auxiliares privados
  private async validateAdminInviter(inviterId: string, companyId: string) {
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId, companyId },
      select: { role: true }
    });

    if (!inviter || inviter.role !== UserRole.ADMIN) {
      throw new NotFoundException('Admin not found or not authorized');
    }
  }

  private async validateEmailNotRegistered(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  }

  private generateInvitationToken() {
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + this.INVITATION_EXPIRATION_HOURS);
    
    return { token, expiration };
  }

  private async sendInvitationEmail(inviteUserDto: InviteUserDto, token: string) {
    try {
      await this.mailService.sendUserInvitation(
        inviteUserDto.email,
        inviteUserDto.firstName,
        token,
        inviteUserDto.role
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  private async validateInvitationToken(token: string, email: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { company: true }
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.email !== email) {
      throw new BadRequestException('Email does not match invitation');
    }

    return invitation;
  }
}