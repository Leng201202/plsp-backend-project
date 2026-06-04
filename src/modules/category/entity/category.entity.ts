import { Employee } from 'src/modules/employee/entity/employee.entity';
import { Question } from 'src/modules/question/entity/question.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  created_by!: Employee;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updated_by?: Employee;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_at?: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by?: Employee;
}
