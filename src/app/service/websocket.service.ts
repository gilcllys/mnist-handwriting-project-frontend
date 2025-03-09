import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: WebSocket;
  private messageSubject: Subject<string> = new Subject<string>();
  private websocketUrl = 'ws://localhost:8000/ws';

  constructor() {
  }

  connect() {
    this.socket = new WebSocket(this.websocketUrl);

    this.socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    this.socket.onmessage = (event) => {
      const message = event.data;
      this.messageSubject.next(message);
    };

    this.socket.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    this.socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };
  }

  sendMessage(message: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn('WebSocket não está conectado. Tentando reconectar...');
      this.connect();
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  // Método para observar as respostas do servidor
  receiveMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }
}
