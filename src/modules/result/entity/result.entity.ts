import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Submission } from '../../submission/entity/submission.entity';
import { Category } from '../../category/entity/category.entity';
import { Employee } from '../../employee/entity/employee.entity';
import { ClassificationRule } from '../../classification/entity/classification-rule.entity';
@Entity('results')
export class Result {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Submission, { nullable: false })
  @JoinColumn({ name: 'submission_id' })
  submission!: Submission;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rawTotalScore!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage!: number;

  @ManyToOne(() => ClassificationRule, { nullable: true })
  @JoinColumn({ name: 'classification_rule_id' })
  classification_rule_id?: ClassificationRule;

  @Column({ type: 'varchar', length: 20 })
  classification!: string;

  @CreateDateColumn({ type: 'timestamp' })
  calculated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deleted_by?: Employee;
}