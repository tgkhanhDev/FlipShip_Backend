import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { Application } from '@prisma/client';
import { CreateApplicationRequest } from './dto/applicationRequest.dto';

@Injectable()
export class ApplicationPortalService {

  private readonly applicationRepository;
  private readonly staffRepository;

  constructor(
    private readonly repository: PrismaPostgresService
  ) {
    this.applicationRepository = repository.application;
    this.staffRepository = repository.staff;
  }

  async createApplication(createApplicationDto: CreateApplicationRequest): Promise<Application> {

    return this.applicationRepository.create({
      data: {
        senderID: createApplicationDto.senderID,
        senderNote: createApplicationDto.senderNote,
        senderFileUrl: createApplicationDto.senderFileUrl
      },
    });
  }

}
