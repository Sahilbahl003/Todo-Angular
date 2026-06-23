import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Todos} from './components/todos/todos';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Todos],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-project-first');
  myName = 'Sahil';
}
