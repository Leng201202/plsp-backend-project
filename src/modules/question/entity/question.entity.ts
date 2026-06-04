import { Category } from "src/modules/category/entity/category.entity";
import { Employee } from "src/modules/employee/entity/employee.entity";
import { Questionnaire } from "src/modules/questionnaire/entity/questionnaire.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('questions')
export class Question{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Questionnaire)
    @JoinColumn({ name: 'questionnaire_id' })
    questionnaire!: Questionnaire;

    @ManyToOne(()=> Category)
    @JoinColumn({ name: 'category_id' })
    category!: Category;

    @Column({name:'question_text',type: 'text'})
    question_text!: string;

    @Column({type: 'int'})
    order_no!: number;

    @Column({type: 'boolean',default: true})
    is_required!: boolean;

    @Column({type: 'int',default: 1})
    weight!: number;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'created_by' })
    created_by!: Employee;

    @CreateDateColumn({type: 'datetime'})
    created_at!: Date;

    @ManyToOne(() => Employee, {nullable: true})
    @JoinColumn({ name: 'updated_by' })
    updated_by?: Employee;

    @UpdateDateColumn({type: 'datetime',nullable: true})
    updated_at?: Date;

    @DeleteDateColumn()
    deleted_at?: Date;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'deleted_by' })
    deleted_by?: Employee;
}