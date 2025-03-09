import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './service/websocket.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private captureInterval: any;
  prediciton: string = '';

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private websocketService: WebsocketService
  ) { }



  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.websocketService.connect();
      await this.startCamera();
      this.receiveMessages();
    }
  }

  async startCamera() {
    if ('mediaDevices' in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.videoElement.nativeElement.srcObject = stream;
        // Inicia o envio das imagens a cada 2 segundos
        this.captureInterval = setInterval(() => {
          this.sendImage();
        }, 2000);
      } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
      }
    } else {
      console.error('API de mídia não suportada neste ambiente.');
    }
  }

  sendImage(): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 28;
      canvas.height = 28;
      context.drawImage(this.videoElement.nativeElement, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/jpeg');
      this.websocketService.sendMessage(image);
    }
  }

  receiveMessages(): void {
    this.websocketService.receiveMessages().subscribe((message) => {
      this.prediciton = message;
      console.log(message);
    });
  }


  ngOnDestroy(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.websocketService.close();
  }


}
