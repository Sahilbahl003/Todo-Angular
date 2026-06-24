import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, NgStyle } from '@angular/common';
import {Todo} from '../../services/todo'//import todod service

@Component({
  selector: 'app-todos',
  imports: [ReactiveFormsModule,NgFor,NgIf,NgClass,NgStyle],
  templateUrl: './todos.html',
  styleUrl: './todos.scss',
})

export class Todos implements OnInit{
  isAdded:boolean=false
  isPending:boolean=true

  isEditMode: boolean = false;
  editingTaskId: number | null = null;
  editingTaskStatus: boolean = false;

  private cdr = inject(ChangeDetectorRef)

  newTodoTitle=''
  myTasks:any[]=[]

   // 2. Use inject() to connec component to our (service)
  private todoService = inject(Todo);

  //Form Group represent our total form
  taskForm = new FormGroup({
    //Creating input tracker field with two validations
    titleInput: new FormControl('',[Validators.required,Validators.minLength(4)])
  })

  ngOnInit() {
    // 3. Pull the tasks from the service when the page loads
    // this.myTasks = this.todoService.getTasks();



    this.todoService.getTaskFromServer().subscribe({
      next:(data)=>{
        this.myTasks=data;
      },
      error:(err)=>{
        console.error("Error occured",err);
      }       
    })
  }


//   addTodo() {
//   if (this.newTodoTitle.trim() !== '') {
//     this.myTasks.push({
//       id: this.myTasks.length + 1,
//       title: this.newTodoTitle,
//       isCompleted: false
//     });
//     this.newTodoTitle = '';
//   }
// }


 startEditTodo(task: any) {
    this.isEditMode = true;
    this.editingTaskId = task.id;
    this.editingTaskStatus = task.IsCompleted || task.isCompleted;

    // We use patchValue to copy the existing text straight back into the input box layout field!
    this.taskForm.patchValue({
      titleInput: task.title
    });
  }

submitReactiveForm(){

  if(this.taskForm.valid)
  {
    const typedValue = this.taskForm.value.titleInput;

    if(typedValue){

      //if in edit mode and open an task to edit
       if (this.isEditMode && this.editingTaskId !== null) {
          this.todoService.editTaskOnServer(this.editingTaskId, typedValue, this.editingTaskStatus).subscribe({
            next: (updatedTask) => {
              // Locate the task inside our local array and update its text live on screen
              const index = this.myTasks.findIndex(t => t.id === this.editingTaskId);
              if (index !== -1) {
                this.myTasks[index] = updatedTask;
              }
              
              // Reset state back to clean default settings
              this.isEditMode = false;
              this.editingTaskId = null;
              this.taskForm.reset();
            },
            error: (err) => console.error("Edit request failed:", err)
          });
        } 
        else//do simple post requests and add new todo task
        {
           this.todoService.addTaskToServer(typedValue).subscribe({
        next:(addedValue)=>{
          this.myTasks.push(addedValue);

          this.taskForm.reset();
          console.log("Data saved ", addedValue)
        },

        error:(err)=>{console.error("error",err)}
      })
        }
     
    }

    // if(typedValue){
    //   this.myTasks.push({
    //     id:this.myTasks.length+1,
    //     title:typedValue,
    //     isCompleted:false
    //   });

    //   this.taskForm.reset();
    // }

  }
}

cancelEdit() {
    this.isEditMode = false;
    this.editingTaskId = null;
    this.taskForm.reset();
  }

deleteReactiveForm(taskId:number){
  this.todoService.deleteTaskFromServer(taskId).subscribe({
   next:()=>{
    this.myTasks=this.myTasks.filter((task)=>task.id!==taskId)
    this.cdr.detectChanges()
    console.log("Task deleted");
   },
   error:(err)=>{
     console.error("error",err);
   }
  })
}

  // taskPriority=['high','medium','low']
  // selectedPriority:string='low'
}