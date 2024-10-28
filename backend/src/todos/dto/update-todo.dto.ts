import { IsBoolean } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';

export class UpdateTodoDto extends CreateTodoDto {
  @IsBoolean({ message: 'isChecked must be a boolean value' })
  isChecked: boolean;
}
