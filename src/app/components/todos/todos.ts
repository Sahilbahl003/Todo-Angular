import { afterNextRender, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, NgStyle, DatePipe } from '@angular/common';
import {Todo} from '../../services/todo'//import todod service
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-todos',
  imports: [ReactiveFormsModule,NgFor,NgIf,NgClass,NgStyle,DatePipe],
  templateUrl: './todos.html',
  styleUrl: './todos.scss',
})

export class Todos implements OnInit,OnDestroy{
  isAdded:boolean=false
  isPending:boolean=true

  isEditMode: boolean = false;
  editingTaskId: number | null = null;
  editingTaskStatus: boolean = false;

  //------Fetch Api Data------
  fetchApiData = signal<any[]>([]);
  readDiskData = signal<any[]>([]);

    fileForm = new FormGroup({
    nameInput: new FormControl('', [Validators.required]),
    emailInput: new FormControl('', [Validators.required])
  });

  private cdr = inject(ChangeDetectorRef)

  newTodoTitle=''
  myTasks:any[]=[]
  computerUsername = signal<string>('Loading...');

  // 4. Create a reactive signal for the device date/time
  deviceDateTime = signal<Date | null>(null); 
  private clockIntervalId: any;

   // 2. Use inject() to connect component to our (service)
  private todoService = inject(Todo);

  //Form Group represent our total form
  taskForm = new FormGroup({
    //Creating input tracker field with two validations
    titleInput: new FormControl('',[Validators.required,Validators.minLength(4)])
  })

   constructor() {
    // Safely wrap browser-only API references inside afterNextRender
    afterNextRender(() => {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        (window as any).electronAPI.getSystemUsername().then((returnedName: string) => {
          // Save the desktop system name inside our reactive signal container safely
          this.computerUsername.set(returnedName);
        }).catch((err: any) => console.error("Electron API Error:", err));
      }
    });


     // --- Live Clock Setup ---
      // Set the initial local device time immediately on the client side
      this.deviceDateTime.set(new Date());

      // Update the device clock every single second
        this.clockIntervalId = setInterval(() => {
        this.deviceDateTime.set(new Date());
      }, 1000);

    }

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
    });
  
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

ngOnDestroy() {
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
    }
  }


    fetchInternetApiData() {
   
    this.todoService.fetchExternalUsers().subscribe({
      next: (response: any) => {
        // Keep the first 3 user profiles
         if (response && response.users && Array.isArray(response.users)) {
          this.fetchApiData.set(response.users.slice(0, 3));
        } else if (Array.isArray(response)) {
          this.fetchApiData.set(response.slice(0, 3));
        }
        // Push change detection so the UI repaints instantly
        this.cdr.detectChanges(); 
        
        console.log('Data successfully fetched from service layer!', response);
      },
      error: (err) => console.error('Fetch failed:', err)
    });
  }



  //-----------its different ------
    saveDataToCDrive() {
    // 1. Grab the array data currently stored in your signal variable
    const dataToSave = this.fetchApiData();

    // Safety Check: If the array is empty, stop and warn the user
    if (dataToSave.length === 0) {
      alert(' Please click "Fetch Internet API Data" first!');
      return;
    }

    // 2. Call the secure preload gateway we created in Step 2
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.saveApiDataToFile(dataToSave).then((response: any) => {
        
        // 3. Electron responds back and tells us if it worked
        if (response.success) {
          alert(` Success! File instantly saved to: ${response.savedPath}`);
        } else {
          alert(` Error saving file: ${response.error}`);
        }
      });
    }
  }

//------------Read file from c drive--------

  readDataFromCDrive() {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.readApiDataFromFile().then((loadedUsers: any[] | null) => {
        if (loadedUsers) {
          this.readDiskData.set(loadedUsers); 
          this.cdr.detectChanges(); 
          console.log(' File loaded successfully.'); //  FIXED: No more blocking alert!
        } else {
          console.error(' File read failed.');
        }
      });
    }
  }

  writeInputDataToFile() {
    const typedName = this.fileForm.value.nameInput;
    const typedEmail = this.fileForm.value.emailInput;

    if (!typedName || !typedEmail || !typedName.trim() || !typedEmail.trim()) {
      alert(' Please fill out both fields!');
      return;
    }

    const newRecord = {
      id: Date.now(), 
      firstName: typedName,
      email: typedEmail
    };

    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.readApiDataFromFile().then((existingList: any[] | null) => {
        let updatedList = existingList && Array.isArray(existingList) ? existingList : [];
        updatedList.push(newRecord);

        (window as any).electronAPI.saveApiDataToFile(updatedList).then((response: any) => {
          if (response.success) {
            console.log(` Success! "${typedName}" saved.`);
            
            // 1. Reset the form inputs natively first
            this.fileForm.reset();
            this.cdr.detectChanges();
            
            // 2. Refresh the display array on the next browser tick
            setTimeout(() => {
              this.readDataFromCDrive();
            }, 50);
          }
        });
      });
    }
  }

    // FILE CRUD CONCEPT: DELETE (Destroy)
  deleteCustomUserFromFile(userId: number) {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      
      // 1. First, read the current complete list from our C-Drive file
      (window as any).electronAPI.readApiDataFromFile().then((existingList: any[] | null) => {
        if (existingList && Array.isArray(existingList)) {
          
          // 2. Filter out the targeted user whose ID matches the clicked row
          const cleanedList = existingList.filter(user => user.id !== userId);
          
          // 3. Shoot the cleaned array down to overwrite our C-Drive file permanently
          (window as any).electronAPI.saveApiDataToFile(cleanedList).then((response: any) => {
            if (response.success) {
              console.log(` Record ID #${userId} successfully deleted from file.`);
              
              // 4. Refresh our screen display signal automatically!
              this.readDataFromCDrive();
            }
          });
        }
      });
    }
  }








  // taskPriority=['high','medium','low']
  // selectedPriority:string='low'
}