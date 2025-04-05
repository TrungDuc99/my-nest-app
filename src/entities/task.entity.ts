import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { TaskComment } from './task-comment.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'in_progress', 'completed', 'cancelled'

  @Column({ default: 'medium' })
  priority: string; // 'low', 'medium', 'high', 'urgent'

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creatorId: string;

  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  projectId: string;

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ default: 0 })
  estimatedHours: number;

  @Column({ default: 0 })
  spentHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
