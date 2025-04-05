import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { TaskComment } from '../../entities/task-comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskComment)
    private taskCommentsRepository: Repository<TaskComment>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['assignee', 'creator', 'project'],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: [
        'assignee',
        'creator',
        'project',
        'comments',
        'comments.user',
      ],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assigneeId },
      relations: ['assignee', 'creator', 'project'],
    });
  }

  async findTasksByCreator(creatorId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { creatorId },
      relations: ['assignee', 'creator', 'project'],
    });
  }

  async findTasksByProject(projectId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { projectId },
      relations: ['assignee', 'creator', 'project'],
    });
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const updatedTask = this.tasksRepository.merge(task, updateTaskDto);
    return this.tasksRepository.save(updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  // Task Comments
  async findCommentsByTaskId(taskId: string): Promise<TaskComment[]> {
    return this.taskCommentsRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async addComment(
    createTaskCommentDto: CreateTaskCommentDto,
  ): Promise<TaskComment> {
    const comment = this.taskCommentsRepository.create(createTaskCommentDto);
    return this.taskCommentsRepository.save(comment);
  }

  async removeComment(commentId: string): Promise<void> {
    const comment = await this.taskCommentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    await this.taskCommentsRepository.remove(comment);
  }
}
