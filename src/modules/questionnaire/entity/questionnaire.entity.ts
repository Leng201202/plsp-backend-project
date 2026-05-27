import { Employee } from "src/modules/employee/entity/employee.entity";
import { Status } from "src/modules/status/entity/status.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('questionnaires')
export class Questionnaire{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({name: 'title', type: 'varchar', length: 255})
    title!: string;

    @Column({name: 'description', type: 'text', nullable: true})
    description?: string;

    @ManyToOne(() => Status)
    @JoinColumn({name: 'status_id'})
    status!: Status;

    @Column({name: 'open_date', type: 'datetime', nullable: true})
    open_date?: Date;

    @Column({name: 'close_date', type: 'datetime', nullable: true})
    close_date?: Date;

    @ManyToOne(()=> Employee)
    @JoinColumn({name: 'created_by'})
    created_by!: Employee;

    @ManyToOne(()=> Employee)
    @JoinColumn({name: 'updated_by'})
    updated_by!: Employee;

    @CreateDateColumn({name: 'created_at'})
    created_at!: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updated_at!: Date;
}