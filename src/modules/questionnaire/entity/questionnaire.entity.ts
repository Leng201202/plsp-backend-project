import { Employee } from 'src/modules/employee/entity/employee.entity';
import { Status } from 'src/modules/status/entity/status.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'status_id' })
  status!: Status;

  @Column({ type: 'timestamp', nullable: true })
  open_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  close_date?: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by' })
  created_by!: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'updated_by' })
  updated_by?: Employee;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'deleted_by' })
  deleted_by?: Employee;
}
