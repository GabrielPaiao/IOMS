// test/outages/outages.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OutagesService } from '../outages/outages.service';
import { PrismaService } from '../shared/prisma/prisma.service';

describe('OutagesService', () => {
  let service: OutagesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutagesService,
        {
          provide: PrismaService,
          useValue: {
            outage: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OutagesService>(OutagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});