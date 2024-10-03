import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MinLength(3, { message: 'Todo text must be at least 3 characters long' })
  @MaxLength(100, { message: 'Todo text must not exceed 100 characters' })
  text: string;
}
