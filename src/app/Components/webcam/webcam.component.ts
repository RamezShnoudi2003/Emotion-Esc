import { NgClass, NgIf, NgStyle } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import * as faceapi from 'face-api.js';
import { ButtonComponent } from '../../UIComponents/button/button.component';

@Component({
  selector: 'app-webcam',
  standalone: true,
  imports: [NgIf, ButtonComponent, NgStyle, NgClass],
  templateUrl: './webcam.component.html',
  styleUrl: './webcam.component.css',
})
export class WebcamComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) public video!: ElementRef;
  @ViewChild('canvas', { static: true }) public canvasRef!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {}
  imageUrl: string | null = null;

  isImageCaptured: boolean = false;
  emotionText: string = '';

  displaySize: any;
  faceCanvas: any; // Separate canvas for face overlay
  isLoading: boolean = true;

  @Output() faceoutput: EventEmitter<any> = new EventEmitter<any>();
  constructor(private readonly elRef: ElementRef) {}

  ngOnDestroy(): void {
    this.stopVideo();
  }

  async ngOnInit() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),
    ]);
    this.startVideo();
  }
  startVideo() {
    this.isLoading = true;

    if (this.isImageCaptured) {
      // Hide captured image container and display video again
      this.isImageCaptured = false;

      // Show video
      const videoEl = this.video.nativeElement;
      videoEl.style.display = 'block';

      // Show "Take Picture" button again
      const takePicBtn = document.querySelector('.takePic') as HTMLElement;
      if (takePicBtn) takePicBtn.style.display = 'block';

      // Hide captured image display
      const picCapturedContainer = document.querySelector(
        '.pic-captured-text-container'
      ) as HTMLElement;
      if (picCapturedContainer) picCapturedContainer.style.display = 'none';
    }

    // Start video stream
    console.log('Starting video...');
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        const videoEl = this.video.nativeElement;
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          this.isLoading = false;
          videoEl.play();
          this.detectFaces();
        };
      })
      .catch((error) => {
        this.isLoading = false;
        console.error('Error accessing webcam:', error);
      });
  }

  async detectFaces() {
    console.log('Detecting faces...');
    const videoEl = this.video.nativeElement;
    this.faceCanvas = faceapi.createCanvasFromMedia(videoEl);
    this.elRef.nativeElement.appendChild(this.faceCanvas);

    this.displaySize = {
      width: videoEl.videoWidth,
      height: videoEl.videoHeight,
    };
    faceapi.matchDimensions(this.faceCanvas, this.displaySize);

    const detectLoop = async () => {
      const detections = await faceapi
        .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(
        detections,
        this.displaySize
      );
      const ctx = this.faceCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.faceCanvas.width, this.faceCanvas.height);

      faceapi.draw.drawDetections(this.faceCanvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(this.faceCanvas, resizedDetections);

      requestAnimationFrame(detectLoop);
    };

    detectLoop();
  }

  async takePicture() {
    const videoEl = this.video.nativeElement;
    const canvasEl = this.canvasRef.nativeElement;
    const ctx = canvasEl.getContext('2d');

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    // Convert canvas to image URL
    this.imageUrl = canvasEl.toDataURL('image/png');
    console.log('Picture Taken:', this.imageUrl);

    // Detect emotions from the captured image
    const detections = await faceapi
      .detectAllFaces(canvasEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    // Get the dominant emotion from the detections
    const emotions: any = detections[0]?.expressions;
    const dominantEmotion = emotions
      ? Object.keys(emotions).reduce((a, b) =>
          emotions[a] > emotions[b] ? a : b
        )
      : '';

    console.log('Detected Emotion:', dominantEmotion);

    this.emotionText = dominantEmotion;

    this.stopVideo();

    let takePicBtn = document.querySelector('.takePic') as HTMLElement;
    takePicBtn.style.display = 'none';
  }

  goBack() {
    this.faceoutput.emit(this.emotionText);
    this.stopVideo();
  }

  stopVideo() {
    const videoEl = this.video.nativeElement;

    // Stop all video tracks
    const stream = videoEl.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Hide video and Face API overlay
    videoEl.style.display = 'none';
    this.faceCanvas.style.display = 'none';

    this.isImageCaptured = true;
  }
}
