import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: WebSocket;
  private messageSubject: Subject<string> = new Subject<string>();

  // constructor() {
  //   this.connect();
  // }

  // private connect(): void {
  //   this.socket = new WebSocket('ws://localhost:8000/ws');

  //   this.socket.onmessage = (event) => {
  //     this.messageSubject.next(event.data);
  //   };

  //   this.socket.onerror = (error) => {
  //     console.error('WebSocket error:', error);
  //   };

  //   this.socket.onclose = () => {
  //     console.log('WebSocket connection closed');
  //   };
  // }

  // public sendMessage(message: string): void {
  //   if (this.socket.readyState === WebSocket.OPEN) {
  //     this.socket.send(message);
  //   } else {
  //     console.error('WebSocket is not open.');
  //   }
  // }

  // public getMessages(): Observable<string> {
  //   return this.messageSubject.asObservable();
  // }
}
