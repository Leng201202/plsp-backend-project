import { Answer } from "src/modules/submission/entity/answer.entity";
import { Employee } from "src/modules/employee/entity/employee.entity";
import { Questionnaire } from "src/modules/questionnaire/entity/questionnaire.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('submissions')
@Unique(['questionnaire', 'anonymousSessionId'])
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Questionnaire, (q) => q.submissions, { nullable: false })
    @JoinColumn({ name: 'questionnaire_id' })
    questionnaire!: Questionnaire;

    @Column({
    name: 'anonymous_session_id',
    type: 'varchar',
    length: 64
    })
    anonymousSessionId!: string;

    @OneToMany(() => Answer, (answer) => answer.submission)
    answers!: Answer[];

    @CreateDateColumn({ type: 'timestamp' })
    submitted_at!: Date;

    @DeleteDateColumn({
    name: 'deleted_at'
    })
    deleted_at?: Date;

    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: 'deleted_by' })
    deleted_by?: Employee;
}