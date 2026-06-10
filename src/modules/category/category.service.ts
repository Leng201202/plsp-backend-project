import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create.category.dto';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/response-category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { CategoryNotFoundException } from 'src/common/exceptions/category.exception';
import { Employee } from '../employee/entity/employee.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const { created_by, ...rest } = dto;
    const category = this.categoryRepository.create({
      ...rest,
      ...(created_by && { created_by: { id: created_by } }),
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

  async update(id: string, dto: UpdateCategoryDto, updated_by: number) {
    const category = await this.categoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!category) {
      throw new CategoryNotFoundException();
    }

    const updateData: any = { 
       name: dto.name?? category.name,
       description: dto.description?? category.description,
     };
    if (updated_by) updateData.updated_by = { id: updated_by };
    const updatedCategory = this.categoryRepository.merge(category, updateData);
    return plainToInstance(
      CategoryResponseDto,
      await this.categoryRepository.save(updatedCategory),
    );
  }

  async delete(id: string, deleted_by: number) {
    const category = await this.categoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!category) {
      throw new CategoryNotFoundException();
    }
    category.deleted_by = { id: deleted_by } as Employee;
    await this.categoryRepository.save(category);
    await this.categoryRepository.softDelete(id);
    return {
      message: 'Category deleted successfully',
      success: true,
    };
  }
}
