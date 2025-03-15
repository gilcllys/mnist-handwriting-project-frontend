import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './service/websocket.service';

interface PredictionMessage {
  predicted_number: number;
  predicted_accuracy: number;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private captureInterval: any;

  predictedNumber: string = '';
  predictedAccuracy: string = '0';

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('processedCanvas', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private websocketService: WebsocketService
  ) { }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // start the websocket connection
      this.websocketService.connect();
      // start the camera
      await this.startCamera();
      // start the process to receive messages from the backend
      this.receiveMessages();
    }
  }

  async startCamera() {
    if ('mediaDevices' in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.videoElement.nativeElement.srcObject = stream;
        this.preProcessedImage();
        // Send image to the backend every 2 seconds
        this.captureInterval = setInterval(() => {
          this.sendImage();
        }, 2000);
      } catch (err) {
        console.error('Erro to acess the camera:', err);
      }
    } else {
      console.error('API not supported in this enviroment');
    }
  }

  sendImage(): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 200;
      canvas.height = 200;
      context.drawImage(this.videoElement.nativeElement, 0, 0, canvas.width, canvas.height);
      // We apply the gray scale filter before sending the image to the backend
      this.applyGrayFiler({ nativeElement: canvas }, context);
      const image = canvas.toDataURL('image/jpeg');
      const imageData = this.websocketService.sendMessage(image);
    }
  }


  receiveMessages(): void {
    this.websocketService.receiveMessages().subscribe((data: PredictionMessage) => {
      this.predictedNumber = data.predicted_number.toString();
      this.predictedAccuracy = (data.predicted_accuracy * 100).toFixed(2).toString();
    });
  }

  // This function show us the result of the pre process image
  private preProcessedImage(): void {
    this.ctx = this.canvasElement.nativeElement.getContext('2d');
    if (this.ctx) {
      setInterval(() => {
        this.ctx?.drawImage(this.videoElement.nativeElement, 0, 0, 500, 450);
        this.applyGrayFiler(this.canvasElement, this.ctx!);
      }, 2000);
    }
  }

  private applyGrayFiler(canvas: ElementRef, context: CanvasRenderingContext2D): void {
    const imageData = context.getImageData(0, 0, canvas.nativeElement.width, canvas.nativeElement.height);
    const pixels = imageData!.data;

    // Apply the gray scale filter
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Formula to convert RGB to gray scale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      pixels[i] = pixels[i + 1] = pixels[i + 2] = gray; // Define RGB with the same intensity
    }

    // Updated canvas with the pre process image
    context.putImageData(imageData!, 0, 0);
  }


  ngOnDestroy(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.websocketService.close();
  }


}
