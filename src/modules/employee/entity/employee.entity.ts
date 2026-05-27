import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('employee')
export class Employee{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({name: 'employee_uuid',type: 'varchar', length: 36, unique: true})
    employee_uuid!: string;

    @Column({name: 'employee_id', type: 'int'})
    employee_id!: number;

    @Column({name: 'employee_code', type: 'varchar', length: 10, unique: true,nullable: true})
    employee_code!: string;

    @Column({name: 'email', unique: true,type: 'varchar', length: 100})
    email!: string;

    @Column({name: 'title_th' ,type: 'varchar', length: 100, nullable: true})
    title_th!: string;

    @Column({name: 'firstname', type: 'varchar', length: 100})
    firstname!: string;

    @Column({name: 'middlename',type: 'varchar', length: 100, nullable: true})
    middlename!: string;

    @Column({name: 'lastname', type: 'varchar', length: 100})
    lastname!: string;

    @Column({name: 'title_en', type: 'varchar', length: 100,nullable: true})
    title_en?: string;

    @Column({name: 'firstname_en', type: 'varchar', length: 100,nullable: true})
    firstname_en?: string;
    
    @Column({name: 'middlename_en', type: 'varchar', length: 100, nullable: true})
    middlename_en?: string;

    @Column({name: 'lastname_en', type: 'varchar', length: 100, nullable: true})
    lastname_en?: string;

    @Column({name: 'institute_id', type: 'int', nullable: true})
    institute_id!: number;

    @Column({name: 'department_id', type: 'int',nullable: true})
    department_id!: number;

    @Column({name: 'position_type', type: 'int',nullable: true})
    position_type!: number;

    @Column({name: 'position_special', type: 'int',nullable: true})
    position_special!: number;

    @Column({name:'last_login_at', type: 'datetime', nullable: true})
    last_login_at!: Date;

    @Column({name:'last_seen_at', type: 'datetime', nullable: true})
    last_seen_at!: Date;

    @Column({name: 'education_level', type: 'tinyint', nullable: true})
    education_level!: number;

    @Column({name: 'mobile', type: 'varchar', length: 10, nullable: true})
    mobile!: string;

    @Column({name: 'work_phone', type: 'varchar', length: 10, nullable: true})
    work_phone!: string;

    @Column({name:'synced_at', type: 'datetime', nullable: true})
    synced_at!: Date;

    @CreateDateColumn({name: 'created_at'})
    createdAt?: Date;

    @UpdateDateColumn({name: 'updated_at',nullable: true})
    updated_at?: Date;

    @DeleteDateColumn({name: 'deleted_at', nullable: true})
    deleted_at?: Date;

    @Column({name: 'is_active', type:'enum', enum: [0, 1], default: 1})
    is_active!: number;

}