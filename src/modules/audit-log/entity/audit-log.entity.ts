import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../../employee/entity/employee.entity";

export enum AuditStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export enum AuditModule {
    EMPLOYEE = 'EMPLOYEE',
    QUESTIONNAIRE = 'QUESTIONNAIRE',
    QUESTION = 'QUESTION',
    CATEGORY = 'CATEGORY',
    STATUS = 'STATUS',
    CLASSIFICATION_RULE = 'CLASSIFICATION_RULE',
    SUBMISSION = 'SUBMISSION',
    RESULT = 'RESULT',
}

export enum AuditAction {
    // Auth
    //LOGIN = 'LOGIN',
    //LOGOUT = 'LOGOUT',

    // module crud
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',

    // export
    EXPORT = 'EXPORT',

    // questionnaire open | close
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',

    // score generate
    GENERATE = 'GENERATE',

    // for iam
    PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}

@Entity('audit-log')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'employee_id' })
    employee_id: number;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employee_id' })
    employee: Employee;

    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Column({
        type:'enum',
        enum:AuditModule,
    })
    module: AuditModule;

    @Column({
        nullable:true,
        length:36,
    })
    record_id:string;

    @Column({
        type:'json',
        nullable:true,
    })
    details: Record<string,any>;

    @Column({
        type:'enum',
        enum:AuditStatus,
        default:AuditStatus.SUCCESS,
    })
    status:AuditStatus;

    @Column({
        length:45,
        nullable:true,
    })
    ip_address:string;

    @Column({
        type: 'text',
        nullable:true,
    })
    user_agent:string;

    @CreateDateColumn()
    timestamp:Date;
}