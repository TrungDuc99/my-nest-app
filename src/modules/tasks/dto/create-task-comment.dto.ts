import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  taskId: string;
}
