import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Task } from './task.entity';
import { Project } from './project.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Unique user ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Column({ length: 100, unique: true })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Column({ length: 100 })
  fullName: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
    enum: ['admin', 'user', 'manager'],
  })
  @Column({ default: 'user' })
  role: string; // 'admin', 'user', 'manager'

  @ApiProperty({
    description: 'User avatar URL',
    required: false,
    example: 'https://example.com/avatar.jpg',
  })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiHideProperty()
  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @ApiHideProperty()
  @OneToMany(() => Task, (task) => task.creator)
  createdTasks: Task[];

  @ApiHideProperty()
  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @ApiProperty({
    description: 'Creation date and time',
    example: '2023-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date and time',
    example: '2023-01-01T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
