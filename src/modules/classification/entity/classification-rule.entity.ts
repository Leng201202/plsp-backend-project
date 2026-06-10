import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Category } from '../../category/entity/category.entity';
import { Employee } from '../../employee/entity/employee.entity';

@Entity('classification_rules')
@Unique(['category', 'label']) // prevent duplicate labels per category
export class ClassificationRule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'varchar', length: 50 })
  label!: string; // Major, Minor, Negligible

  @Column({ type: 'int' })
  min_score!: number;

  @Column({ type: 'int' })
  max_score!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by!: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updated_by?: Employee;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deleted_by?: Employee;
}