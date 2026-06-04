import { Employee } from "src/modules/employee/entity/employee.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('status')
export class Status {

    @PrimaryGeneratedColumn('uuid')
    id!: string;//UUID primary key
    
    @Column({ name: 'name' , type: 'varchar', length: 50, unique: true })
    name!: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description?: string;

    @ManyToOne(()=> Employee)
    @JoinColumn({ name: 'created_by' })
    created_by?: Employee;

    @CreateDateColumn({ name:'created_at' })
    created_at?: Date;

    @ManyToOne(()=> Employee, { nullable: true })
    @JoinColumn({ name: 'updated_by' })
    updated_by?: Employee;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updated_at?: Date;

    @DeleteDateColumn()
    deleted_at?: Date;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'deleted_by' })
    deleted_by?: Employee;
}