import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass, NgStyle } from '@angular/common';
import {Todo} from '../../services/todo'//import todod service

@Component({
  selector: 'app-todos',
  imports: [FormsModule,NgFor,NgIf,NgClass,NgStyle],
  templateUrl: './todos.html',
  styleUrl: './todos.scss',
})

export class Todos implements OnInit{
  isAdded:boolean=false
  isPending:boolean=true

  newTodoTitle=''
  myTasks:any[]=[]

   // 2. Use inject() to connec component to our (service)
  private todoService = inject(Todo);

  ngOnInit() {
    // 3. Pull the tasks from the service when the page loads
    this.myTasks = this.todoService.getTasks();
  }


  addTodo() {
  if (this.newTodoTitle.trim() !== '') {
    this.myTasks.push({
      id: this.myTasks.length + 1,
      title: this.newTodoTitle,
      isCompleted: false
    });
    this.newTodoTitle = '';
  }
}


  taskPriority=['high','medium','low']
  selectedPriority:string='low'
}
