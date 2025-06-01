import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/common/exception/forbidden.exception';
import { NotFoundException } from 'src/common/exception/not-found.exception';
import { Pagination } from 'src/shared/paginate';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplatesSearchFilterDto } from './dto/email-templates-search-filter.dto';
import { EmailTemplate } from './serializer/email-template.serializer';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * convert string to slug
   * @param text
   */
  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Transform EmailTemplate to serializer format
   * @param template
   */
  private transformTemplate(template: any): EmailTemplate {
    return {
      id: template.id,
      title: template.title,
      slug: template.slug,
      sender: template.sender,
      subject: template.subject,
      body: template.body,
      isDefault: template.isDefault,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }

  /**
   * Find Email Template By Slug
   * @param slug
   */
  async findBySlug(slug: string): Promise<{ body: string } | null> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { slug },
      select: { body: true }
    });
    return template;
  }

  /**
   * Create new Email Template
   * @param createEmailTemplateDto
   */
  async create(
    createEmailTemplateDto: CreateEmailTemplateDto
  ): Promise<EmailTemplate> {
    // Check if template with same title exists
    const existingTemplate = await this.prisma.emailTemplate.findUnique({
      where: { title: createEmailTemplateDto.title }
    });

    if (existingTemplate) {
      const errorPayload: ValidationPayloadInterface[] = [
        {
          property: 'title',
          constraints: { unique: 'already taken' }
        }
      ];
      throw new UnprocessableEntityException(errorPayload);
    }

    const slug = this.slugify(createEmailTemplateDto.title);
    const templateData: Prisma.EmailTemplateCreateInput = {
      title: createEmailTemplateDto.title,
      slug,
      sender: createEmailTemplateDto.sender,
      subject: createEmailTemplateDto.subject,
      body: createEmailTemplateDto.body,
      isDefault: createEmailTemplateDto.isDefault || false
    };

    const template = await this.prisma.emailTemplate.create({
      data: templateData
    });
    return this.transformTemplate(template);
  }

  /**
   * Get all email templates paginated list
   * @param filter
   */
  async findAll(
    filter: EmailTemplatesSearchFilterDto
  ): Promise<Pagination<EmailTemplate>> {
    const { page = 1, limit = 10, keywords } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.EmailTemplateWhereInput = {};
    if (keywords) {
      where.OR = [
        { title: { contains: keywords } },
        { subject: { contains: keywords } },
        { body: { contains: keywords } },
        { sender: { contains: keywords } }
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.emailTemplate.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.emailTemplate.count({ where })
    ]);

    const serializedTemplates = templates.map((template) =>
      this.transformTemplate(template)
    );

    return new Pagination({
      results: serializedTemplates,
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      next: page < Math.ceil(total / limit) ? page + 1 : null,
      previous: page > 1 ? page - 1 : null
    });
  }

  /**
   * Find Email Template By Id
   * @param id
   */
  async findOne(id: number): Promise<EmailTemplate> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id }
    });
    if (!template) {
      throw new NotFoundException('Email template not found');
    }
    return this.transformTemplate(template);
  }

  /**
   * Update Email Template by id
   * @param id
   * @param updateEmailTemplateDto
   */
  async update(
    id: number,
    updateEmailTemplateDto: UpdateEmailTemplateDto
  ): Promise<EmailTemplate> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id }
    });
    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    // Check if title is unique (excluding current template)
    if (updateEmailTemplateDto.title) {
      const existingTemplate = await this.prisma.emailTemplate.findFirst({
        where: {
          title: updateEmailTemplateDto.title,
          NOT: { id }
        }
      });

      if (existingTemplate) {
        const errorPayload: ValidationPayloadInterface[] = [
          {
            property: 'title',
            constraints: { unique: 'already taken' }
          }
        ];
        throw new UnprocessableEntityException(errorPayload);
      }
    }

    const updateData: Prisma.EmailTemplateUpdateInput = {};
    if (updateEmailTemplateDto.title) {
      updateData.title = updateEmailTemplateDto.title;
      updateData.slug = this.slugify(updateEmailTemplateDto.title);
    }
    if (updateEmailTemplateDto.sender)
      updateData.sender = updateEmailTemplateDto.sender;
    if (updateEmailTemplateDto.subject)
      updateData.subject = updateEmailTemplateDto.subject;
    if (updateEmailTemplateDto.body)
      updateData.body = updateEmailTemplateDto.body;
    if (updateEmailTemplateDto.isDefault !== undefined)
      updateData.isDefault = updateEmailTemplateDto.isDefault;

    const updatedTemplate = await this.prisma.emailTemplate.update({
      where: { id },
      data: updateData
    });

    return this.transformTemplate(updatedTemplate);
  }

  /**
   * Remove Email Template By id
   * @param id
   */
  async remove(id: number): Promise<void> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id }
    });
    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    if (template.isDefault) {
      throw new ForbiddenException(
        ExceptionTitleList.DeleteDefaultError,
        StatusCodesList.DeleteDefaultError
      );
    }

    await this.prisma.emailTemplate.delete({ where: { id } });
  }
}
