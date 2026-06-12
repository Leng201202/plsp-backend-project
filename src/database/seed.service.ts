import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../modules/employee/entity/employee.entity';
import { Status } from '../modules/status/entity/status.entity';
import { Category } from '../modules/category/entity/category.entity';
import { Questionnaire } from '../modules/questionnaire/entity/questionnaire.entity';
import { Question } from '../modules/question/entity/question.entity';
import { ClassificationRule } from '../modules/classification/entity/classification-rule.entity';
import { Submission } from '../modules/submission/entity/submission.entity';
import { Answer } from '../modules/submission/entity/answer.entity';
import { Result } from '../modules/result/entity/result.entity';

interface ClassificationRuleSeedData {
  categoryName: string;
  label: string;
  min_score: number;
  max_score: number;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

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
    @InjectRepository(ClassificationRule)
    private readonly classificationRuleRepository: Repository<ClassificationRule>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
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
    if (!admin) {
      this.logger.error('Admin user not found, cannot seed classification rules!');
      return;
    }

    // 2. Seed Statuses
    const statusCount = await this.statusRepository.count();
    let draftStatus, openStatus, closeStatus;
    if (statusCount > 0) {
      console.log('Seed: Statuses already exist. Skipping.');
      draftStatus = await this.statusRepository.findOne({
        where: { name: 'draft' },
      });
      openStatus = await this.statusRepository.findOne({
        where: { name: 'open' },
      });
      closeStatus = await this.statusRepository.findOne({
        where: { name: 'close' },
      });
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

    // 3. Clean up old categories and seed only 6 learning style categories
    const categoryNames = ['Visual', 'Auditory', 'Kinesthetic', 'Tactile', 'Group', 'Individual'];
    
    // Clean up old categories that aren't in our learning style list
    const existingCategories = await this.categoryRepository.find();
    for (const cat of existingCategories) {
      if (!categoryNames.includes(cat.name)) {
        await this.categoryRepository.softRemove(cat);
        console.log(`Seed: Removed old category "${cat.name}"`);
      }
    }

    const categories: Category[] = [];

    for (const catName of categoryNames) {
      let category = await this.categoryRepository.findOne({ where: { name: catName } });
      if (!category) {
        category = await this.categoryRepository.save({
          name: catName,
          description: `${catName} learning style assessment`,
          created_by: { id: admin.id },
        } as any);
        console.log(`Seed: Created category "${catName}"`);
      }
      if (category) {
        categories.push(category);
      }
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
      questionnaires = await this.questionnaireRepository.save(
        qnareData as any,
      );
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

    // 6. Seed Classification Rules for Learning Style Categories
    const learningStyleCategories = [
      'Visual',
      'Auditory',
      'Kinesthetic',
      'Tactile',
      'Group',
      'Individual',
    ];

    const classificationRulesToSeed: ClassificationRuleSeedData[] = [];
    for (const categoryName of learningStyleCategories) {
      classificationRulesToSeed.push(
        { categoryName, label: 'Major', min_score: 38, max_score: 50 },
        { categoryName, label: 'Minor', min_score: 25, max_score: 37 },
        { categoryName, label: 'Negligible', min_score: 0, max_score: 24 },
      );
    }

    let rulesCreated = 0;
    let rulesSkipped = 0;
    let rulesFailed = 0;

    for (const ruleData of classificationRulesToSeed) {
      try {
        const category = await this.categoryRepository.findOne({
          where: { name: ruleData.categoryName },
        });

        if (!category) {
          this.logger.warn(
            `Category "${ruleData.categoryName}" not found. Skipping rule "${ruleData.label}".`,
          );
          rulesSkipped++;
          continue;
        }

        const existingRule = await this.classificationRuleRepository.findOne({
          where: {
            category: { id: category.id },
            label: ruleData.label,
          },
        });

        if (existingRule) {
          this.logger.log(
            `Classification rule "${ruleData.label}" for category "${ruleData.categoryName}" already exists. Skipping.`,
          );
          rulesSkipped++;
          continue;
        }

        const newRule = this.classificationRuleRepository.create({
          category: { id: category.id },
          label: ruleData.label,
          min_score: ruleData.min_score,
          max_score: ruleData.max_score,
          is_active: true,
          created_by: { id: admin.id },
        });

        await this.classificationRuleRepository.save(newRule);
        this.logger.log(
          `Created classification rule "${ruleData.label}" for category "${ruleData.categoryName}"`,
        );
        rulesCreated++;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to create rule "${ruleData.label}" for category "${ruleData.categoryName}": ${errorMessage}`,
        );
        rulesFailed++;
      }
    }

    this.logger.log(
      `Classification Rules - Created: ${rulesCreated}, Skipped: ${rulesSkipped}, Failed: ${rulesFailed}`,
    );

    // 7. Seed Submissions
    const submissionCount = await this.submissionRepository.count();
    let submissions: Submission[] = [];
    if (submissionCount > 0) {
      console.log('Seed: Submissions already exist. Skipping.');
      submissions = await this.submissionRepository.find();
    } else {
      const submissionData = [
        {
          questionnaire: questionnaires[0],
          anonymousSessionId: 'session-001',
        },
        {
          questionnaire: questionnaires[0],
          anonymousSessionId: 'session-002',
        },
      ];
      submissions = await this.submissionRepository.save(submissionData as any);
      console.log('Seed: Submissions created.');
    }

    // 8. Seed Answers
    const answerCount = await this.answerRepository.count();
    if (answerCount > 0) {
      console.log('Seed: Answers already exist. Skipping.');
    } else {
      const questions = await this.questionRepository.find();
      const answers: any[] = [];
      for (const submission of submissions) {
        for (const question of questions) {
          answers.push({
            submission: submission,
            question: question,
            selected_value: Math.floor(Math.random() * 5) + 1,
          });
        }
      }
      await this.answerRepository.save(answers);
      console.log('Seed: Answers created.');
    }

    // 9. Seed Results
    const resultCount = await this.resultRepository.count();
    if (resultCount > 0) {
      console.log('Seed: Results already exist. Skipping.');
    } else {
      const learningCategories = await this.categoryRepository.find({
        where: [
          { name: 'Visual' },
          { name: 'Auditory' },
          { name: 'Kinesthetic' },
          { name: 'Tactile' },
          { name: 'Group' },
          { name: 'Individual' },
        ],
      });

      const results: any[] = [];
      for (const submission of submissions) {
        for (const category of learningCategories) {
          const classificationRule = await this.classificationRuleRepository.findOne({
            where: { category: { id: category.id }, label: 'Major' },
          });

          const rawTotalScore = Math.floor(Math.random() * 50) + 1;
          const percentage = (rawTotalScore / 50) * 100;

          results.push({
            submission: submission,
            category: category,
            rawTotalScore: rawTotalScore,
            percentage: percentage,
            classificationRule: classificationRule,
            classification: classificationRule?.label || 'Unknown',
          });
        }
      }
      await this.resultRepository.save(results);
      console.log('Seed: Results created.');
    }
  }
}
