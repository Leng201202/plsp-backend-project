import { Employee } from "src/modules/employee/entity/employee.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity('status')
export class Status {

    @PrimaryGeneratedColumn('uuid')
    id!: string;//UUID primary key
    
    @Column({ name: 'name' , type: 'varchar', length: 50, unique: true })
    name!: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'created_by'})
    @ManyToOne(()=> Employee)
    @JoinColumn({ name: 'created_by' })
    createdBy?: Employee;

    @CreateDateColumn({ name:'created_at' })
    created_at?: Date;

    @Column({ name: 'updated_by', nullable: true })
    updated_by?: Employee;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updated_at?: Date;
}