import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create.category.dto';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/response-category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { CategoryNotFoundException } from 'src/common/exceptions/category.exception';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const { created_by, updated_by, ...rest } = dto;
    const category = this.categoryRepository.create({
      ...rest,
      ...(created_by && { created_by: { id: created_by } }),
      ...(updated_by && { updated_by: { id: updated_by } }),
    } as any);
    return plainToInstance(
      CategoryResponseDto,
      await this.categoryRepository.save(category),
    );
  }

  async findAll() {
    return plainToInstance(
      CategoryResponseDto,
      await this.categoryRepository.find({
        where: {
          deleted_at: IsNull(),
        },
        relations: {
          created_by: true,
          updated_by: true,
        },
      }),
    );
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: {
        created_by: true,
        updated_by: true,
      },
    });
    if (!category) {
      throw new CategoryNotFoundException();
    }
    return plainToInstance(CategoryResponseDto, category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!category) {
      throw new CategoryNotFoundException();
    }

    const { created_by, updated_by, ...rest } = dto;
    const updateData: any = { ...rest };
    if (created_by) updateData.created_by = { id: created_by };
    if (updated_by) updateData.updated_by = { id: updated_by };

    const updatedCategory = this.categoryRepository.merge(category, updateData);
    return plainToInstance(
      CategoryResponseDto,
      await this.categoryRepository.save(updatedCategory),
    );
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!category) {
      throw new CategoryNotFoundException();
    }
    await this.categoryRepository.softDelete(id);
    return {
      message: 'Category deleted successfully',
      success: true,
    };
  }
}
