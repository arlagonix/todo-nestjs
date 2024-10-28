import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  private readonly todos: Todo[] = [];
  private idCounter = 1;

  create(createTodoDto: CreateTodoDto) {
    const newTodo: Todo = {
      id: this.idCounter,
      ...createTodoDto,
      isChecked: false,
    };
    this.idCounter++;
    this.todos.push(newTodo);
    return {
      message: 'This action added a new todo',
      details: newTodo,
    };
  }

  findAll() {
    return this.todos;
  }

  findOne(id: number) {
    const todo = this.todos.find((item) => item.id === id);
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    // Find the todo to be changed
    const todoIndex = this.todos.findIndex((item) => item.id === id);
    const todo = this.todos[todoIndex];

    // Return error if unable to find it
    if (todoIndex === -1) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    // Update the todo
    this.todos[todoIndex] = {
      id: todo.id,
      ...updateTodoDto,
    };

    // Return response
    return {
      message: `This action updated a #${id} todo`,
      details: updateTodoDto,
    };
  }

  remove(id: number) {
    /* Find the item */
    const indexOfItemToDelete = this.todos.findIndex((item) => item.id === id);

    /* Error when trying to delete an item that doesn't exist */
    if (indexOfItemToDelete === -1) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    /* Delete the item */
    this.todos.splice(indexOfItemToDelete, 1);

    return `This action removed a #${id} todo`;
  }

  clear() {
    this.todos.length = 0;
    return 'This action deleted all todos';
  }
}
