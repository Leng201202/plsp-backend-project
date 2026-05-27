import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../modules/employee/entity/employee.entity';
import { Status } from '../modules/status/entity/status.entity';
import { Category } from '../modules/category/entity/category.entity';
import { Questionnaire } from '../modules/questionnaire/entity/questionnaire.entity';
import { Question } from '../modules/question/entity/question.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    // 1. Seed Employees
    const employeeCount = await this.employeeRepository.count();
    if (employeeCount > 0) {
      console.log('Seed: Employees already exist. Skipping.');
    } else {
      const employees = [
        {
          id: 1,
          employee_uuid: 'uuid-emp-1',
          employee_id: 1001,
          employee_code: 'EMP001',
          email: 'admin@example.com',
          firstname: 'Admin',
          lastname: 'User',
        },
        {
          id: 2,
          employee_uuid: 'uuid-emp-2',
          employee_id: 1002,
          employee_code: 'EMP002',
          email: 'editor@example.com',
          firstname: 'Editor',
          lastname: 'User',
        },
        {
          id: 3,
          employee_uuid: 'uuid-emp-3',
          employee_id: 1003,
          employee_code: 'EMP003',
          email: 'viewer@example.com',
          firstname: 'Viewer',
          lastname: 'User',
        },
      ];
      await this.employeeRepository.save(employees);
      console.log('Seed: Employees created.');
    }

    const admin = await this.employeeRepository.findOne({ where: { id: 1 } });

    // 2. Seed Statuses
    const statusCount = await this.statusRepository.count();
    let draftStatus, openStatus, closeStatus;
    if (statusCount > 0) {
      console.log('Seed: Statuses already exist. Skipping.');
      draftStatus = await this.statusRepository.findOne({ where: { name: 'draft' } });
      openStatus = await this.statusRepository.findOne({ where: { name: 'open' } });
      closeStatus = await this.statusRepository.findOne({ where: { name: 'close' } });
    } else {
      const statuses = [
        { name: 'draft', description: 'Draft stage', createdBy: admin },
        { name: 'open', description: 'Open for submissions', createdBy: admin },
        { name: 'close', description: 'Closed/Finished', createdBy: admin },
      ];
      const savedStatuses = await this.statusRepository.save(statuses as any);
      draftStatus = savedStatuses[0];
      openStatus = savedStatuses[1];
      closeStatus = savedStatuses[2];
      console.log('Seed: Statuses created.');
    }

    // 3. Seed Categories
    const categoryCount = await this.categoryRepository.count();
    let categories: Category[] = [];
    if (categoryCount > 0) {
      console.log('Seed: Categories already exist. Skipping.');
      categories = await this.categoryRepository.find();
    } else {
      const catData = [
        { name: 'General', description: 'General questions', created_by: admin },
        { name: 'Education', description: 'Education related', created_by: admin },
        { name: 'Technical', description: 'Technical skills', created_by: admin },
        { name: 'Soft Skills', description: 'Soft skills and behavior', created_by: admin },
      ];
      categories = await this.categoryRepository.save(catData as any);
      console.log('Seed: Categories created.');
    }

    // 4. Seed Questionnaires
    const qnareCount = await this.questionnaireRepository.count();
    let questionnaires: Questionnaire[] = [];
    if (qnareCount > 0) {
      console.log('Seed: Questionnaires already exist. Skipping.');
      questionnaires = await this.questionnaireRepository.find();
    } else {
      const qnareData = [
        {
          title: 'PLSP Learning Style Assessment',
          description: 'Survey for students',
          status: openStatus,
          open_date: new Date(),
          close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          created_by: admin,
        },
        {
          title: 'Industry Feedback Survey',
          description: 'Survey for partners',
          status: draftStatus,
          open_date: new Date(),
          close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          created_by: admin,
        },
      ];
      questionnaires = await this.questionnaireRepository.save(qnareData as any);
      console.log('Seed: Questionnaires created.');
    }

    // 5. Seed Questions
    const questionCount = await this.questionRepository.count();
    if (questionCount > 0) {
      console.log('Seed: Questions already exist. Skipping.');
    } else {
      const questions: any[] = [];
      // Q1 has 3 questions
      for (let i = 1; i <= 3; i++) {
        questions.push({
          questionnaire: questionnaires[0],
          category: categories[i % 4],
          question_text: `Question ${i} for ${questionnaires[0].title}`,
          order_no: i,
          is_required: true,
          weight: 1,
          created_by: admin,
        });
      }
      // Q2 has 3 questions
      for (let i = 1; i <= 3; i++) {
        questions.push({
          questionnaire: questionnaires[1],
          category: categories[(i + 1) % 4],
          question_text: `Question ${i} for ${questionnaires[1].title}`,
          order_no: i,
          is_required: false,
          weight: 1,
          created_by: admin,
        });
      }
      await this.questionRepository.save(questions);
      console.log('Seed: Questions created.');
    }
  }
}
