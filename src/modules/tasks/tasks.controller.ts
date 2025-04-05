import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { Task } from '../../entities/task.entity';
import { TaskComment } from '../../entities/task-comment.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAll(
    @Query('assigneeId') assigneeId?: string,
    @Query('creatorId') creatorId?: string,
    @Query('projectId') projectId?: string,
  ): Promise<Task[]> {
    if (assigneeId) {
      return this.tasksService.findTasksByAssignee(assigneeId);
    }
    if (creatorId) {
      return this.tasksService.findTasksByCreator(creatorId);
    }
    if (projectId) {
      return this.tasksService.findTasksByProject(projectId);
    }
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id);
  }

  // Comments
  @Get(':taskId/comments')
  async findComments(@Param('taskId') taskId: string): Promise<TaskComment[]> {
    return this.tasksService.findCommentsByTaskId(taskId);
  }

  @Post('comments')
  async addComment(
    @Body() createTaskCommentDto: CreateTaskCommentDto,
  ): Promise<TaskComment> {
    return this.tasksService.addComment(createTaskCommentDto);
  }

  @Delete('comments/:commentId')
  async removeComment(@Param('commentId') commentId: string): Promise<void> {
    return this.tasksService.removeComment(commentId);
  }
}
