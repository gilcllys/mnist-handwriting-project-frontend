import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

interface PredictionMessage {
  predicted_number: number;
  predicted_accuracy: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: WebSocket;
  private messageSubject: Subject<PredictionMessage> = new Subject<PredictionMessage>();
  private websocketUrl = 'ws://localhost:8000/ws';

  constructor() {
  }

  connect() {
    this.socket = new WebSocket(this.websocketUrl);

    this.socket.onopen = () => {
      console.log('Conectado ao WebSocket');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
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
      this.socket.send(JSON.stringify(message));
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
  receiveMessages(): Observable<PredictionMessage> {
    return this.messageSubject.asObservable();
  }
}
