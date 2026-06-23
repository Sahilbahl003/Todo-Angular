import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Todo {
  myTasks = [
    { id: 10, title: 'Buy groceries from the market', isCompleted: false },
    { id: 20, title: 'Fix the bedroom lighting setup', isCompleted: true },
    { id: 30, title: 'Complete Angular 21 tutorials', isCompleted: false }
  ];

  getTasks() {
    return this.myTasks;
  }
}
