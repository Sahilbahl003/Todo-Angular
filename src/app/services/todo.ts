import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Todo {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/todos'


  getTaskFromServer():Observable<any[]>{
    return this.http.get<any[]>(this.apiUrl);
  }

  addTaskToServer(newTaskTitle:string):Observable<any>{
    const body ={title:newTaskTitle,IsCompleted:false}
    return this.http.post<any>(this.apiUrl,body);
  }

  editTaskOnServer(taskId:number,newTitle:string,isCompleted:boolean):Observable<any>{
    const body={title:newTitle,IsCompleted:isCompleted}
     return this.http.patch<any>(`${this.apiUrl}/${taskId}`, body);
  }

  deleteTaskFromServer(taskId:number):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/${taskId}`);
  }
  // myTasks = [
  //   { id: 10, title: 'Buy groceries from the market', isCompleted: false },
  //   { id: 20, title: 'Fix the bedroom lighting setup', isCompleted: true },
  //   { id: 30, title: 'Complete Angular 21 tutorials', isCompleted: false }
  // ];

  // getTasks() {
  //   return this.myTasks;
  // }
}
