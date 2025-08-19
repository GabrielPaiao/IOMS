import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ===== CONVERSAS =====

  async createConversation(userId: string, createConversationDto: CreateConversationDto) {
    const { participantIds, ...conversationData } = createConversationDto;

    // Verificar se o usuário está incluído nos participantes
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // Verificar se todos os usuários existem
    const users = await this.prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: { id: true, firstName: true, lastName: true }
    });

    if (users.length !== participantIds.length) {
      throw new NotFoundException('Um ou mais usuários não foram encontrados');
    }

    // Criar a conversa
    const conversation = await this.prisma.chatConversation.create({
      data: {
        ...conversationData,
        createdBy: userId,
        participants: {
          create: participantIds.map(participantId => ({
            userId: participantId,
            role: participantId === userId ? 'OWNER' : 'MEMBER'
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    return conversation;
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        lastMessage: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return conversations;
  }

  async getConversationById(userId: string, conversationId: string) {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada ou acesso negado');
    }

    return conversation;
  }

  async updateConversation(userId: string, conversationId: string, updateConversationDto: UpdateConversationDto) {
    // Verificar se o usuário é dono da conversa
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participant || participant.role !== 'OWNER') {
      throw new ForbiddenException('Apenas o dono da conversa pode editá-la');
    }

    const conversation = await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: updateConversationDto,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return conversation;
  }

  async deleteConversation(userId: string, conversationId: string) {
    // Verificar se o usuário é dono da conversa
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participant || participant.role !== 'OWNER') {
      throw new ForbiddenException('Apenas o dono da conversa pode excluí-la');
    }

    // Excluir mensagens primeiro
    await this.prisma.chatMessage.deleteMany({
      where: { conversationId: conversationId }
    });

    // Excluir participantes
    await this.prisma.chatParticipant.deleteMany({
      where: { conversationId: conversationId }
    });

    // Excluir a conversa
    await this.prisma.chatConversation.delete({
      where: { id: conversationId }
    });

    return { message: 'Conversa excluída com sucesso' };
  }

  // ===== MENSAGENS =====

  async createMessage(userId: string, createMessageDto: CreateMessageDto) {
    const { conversationId, ...messageData } = createMessageDto;

    // Verificar se o usuário é participante da conversa
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participant) {
      throw new ForbiddenException('Você não é participante desta conversa');
    }

    // Criar a mensagem
    const message = await this.prisma.chatMessage.create({
      data: {
        ...messageData,
        userId: userId,
        conversationId: conversationId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        replyToMessage: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Atualizar a data de atualização da conversa
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  async getMessages(userId: string, conversationId: string, page: number = 1, limit: number = 50) {
    // Verificar se o usuário é participante da conversa
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participant) {
      throw new ForbiddenException('Você não é participante desta conversa');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { conversationId: conversationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          replyToMessage: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit
      }),
      this.prisma.chatMessage.count({
        where: { conversationId: conversationId }
      })
    ]);

    return {
      messages: messages.reverse(), // Ordem cronológica
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: userId }
            }
          }
        }
      }
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    // Verificar se o usuário pode deletar a mensagem
    const participant = message.conversation.participants[0];
    if (!participant || (participant.role !== 'OWNER' && message.userId !== userId)) {
      throw new ForbiddenException('Você não pode deletar esta mensagem');
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId }
    });

    return { message: 'Mensagem deletada com sucesso' };
  }

  // ===== FUNCIONALIDADES ADICIONAIS =====

  async markConversationAsRead(userId: string, conversationId: string) {
    // Marcar todas as mensagens não lidas como lidas
    await this.prisma.chatMessage.updateMany({
      where: {
        conversationId: conversationId,
        userId: { not: userId },
        readBy: {
          none: {
            userId: userId
          }
        }
      },
      data: {
        readBy: {
          create: {
            userId: userId,
            readAt: new Date()
          }
        }
      }
    });

    return { message: 'Conversa marcada como lida' };
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        _count: {
          select: {
            messages: {
              where: {
                userId: { not: userId },
                readBy: {
                  none: {
                    userId: userId
                  }
                }
              }
            }
          }
        }
      }
    });

    const totalUnread = conversations.reduce((total, conv) => total + conv._count.messages, 0);

    return {
      totalUnread,
      conversations: conversations.map(conv => ({
        conversationId: conv.id,
        unreadCount: conv._count.messages
      }))
    };
  }

  async searchMessages(userId: string, query: string, conversationId?: string) {
    const where: any = {
      content: {
        contains: query,
        mode: 'insensitive'
      }
    };

    if (conversationId) {
      where.conversationId = conversationId;
    } else {
      // Buscar apenas em conversas onde o usuário é participante
      where.conversation = {
        participants: {
          some: {
            userId: userId
          }
        }
      };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        conversation: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return messages;
  }

  // ===== CONVERSAS RELACIONADAS A OUTAGES/APLICAÇÕES =====

  async getOutageConversation(outageId: string) {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: {
        relatedOutageId: outageId,
        type: 'outage'
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return conversation;
  }

  async getApplicationConversation(applicationId: string) {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: {
        relatedApplicationId: applicationId,
        type: 'application'
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return conversation;
  }
}
