import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create.category.dto';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/response-category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { CategoryNotFoundException } from 'src/common/exceptions/category.exception';
import { Employee } from '../employee/entity/employee.entity';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly audit: AuditHelper,
  ) {}

  async create(dto: CreateCategoryDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.CREATE, module: AuditModule.CATEGORY };
    try {
      const { created_by, ...rest } = dto;
      const category = this.categoryRepository.create({
        ...rest,
        created_by: { id: created_by || employeeId },
      } as DeepPartial<Category>);
      const saved = await this.categoryRepository.save(category);
      await this.audit.logSuccess({ ...base, recordId: saved.id, details: { name: saved.name } });
      return plainToInstance(CategoryResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { name: dto.name } }, error);
      throw error;
    }
  }

  async findAll() {
    return plainToInstance(
      CategoryResponseDto,
      await this.categoryRepository.find({
        where: { deleted_at: IsNull() },
        relations: { created_by: true, updated_by: true },
      }),
    );
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: { created_by: true, updated_by: true },
    });
    if (!category) throw new CategoryNotFoundException();
    return plainToInstance(CategoryResponseDto, category);
  }

  async update(id: string, dto: UpdateCategoryDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.CATEGORY, recordId: id };
    let previous: Category | undefined;
    try {
      const category = await this.categoryRepository.findOne({ where: { id, deleted_at: IsNull() } });
      if (!category) throw new CategoryNotFoundException();
      previous = { ...category };
      const updateData: any = {
        name: dto.name ?? category.name,
        description: dto.description ?? category.description,
      };
      if (employeeId) updateData.updated_by = { id: employeeId } as Employee;
      const saved = await this.categoryRepository.save(this.categoryRepository.merge(category, updateData));
      await this.audit.logSuccess({ ...base, details: { old: previous, new: saved } });
      return plainToInstance(CategoryResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { old: previous, new: dto } }, error);
      throw error;
    }
  }

  async delete(id: string, employeeId: number) {
    const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.CATEGORY, recordId: id };
    let categoryName = '';
    try {
      const category = await this.categoryRepository.findOne({ where: { id, deleted_at: IsNull() } });
      if (!category) throw new CategoryNotFoundException();
      categoryName = category.name;
      category.deleted_by = { id: employeeId } as Employee;
      await this.categoryRepository.save(category);
      await this.categoryRepository.softDelete(id);
      await this.audit.logSuccess({ ...base, details: { name: categoryName } });
      return { message: 'Category deleted successfully', success: true };
    } catch (error) {
      await this.audit.logFailure({ ...base, details: categoryName ? { name: categoryName } : {} }, error);
      throw error;
    }
  }
}
