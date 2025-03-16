import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceDetectorService {
  constructor() { }

  isMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobile || isTouchDevice;
  }
}
