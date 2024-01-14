import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ElementRef, OnInit, ViewChild } from '@angular/core';
//import { Action } from 'rxjs/internal/scheduler/Action';


@Component({
  selector: 'mediaplayer',
  standalone: true,
  imports: [],
  templateUrl: './mediaplayer.component.html',
  styleUrl: './mediaplayer.component.less'
})
export class MediaPlayerComponent implements OnInit {

  private _audioContext!: AudioContext;
  private _audioAnalyser: AnalyserNode | any;
  private _audioBuffer: AudioBufferSourceNode | any;
  private _renderContext: CanvasRenderingContext2D | any;
  private _trackDuration: number = 0;
  private _startTime: number = 0;
  private _elapsedTime: number = 0;
  private _tillTime: number = 0;
  private _media_url: string | any;
  private _initialized: boolean = false;
  private _playing: boolean = false;
  private _timerid: ReturnType<typeof setInterval> | any;

  @ViewChild('renderer', {static: true})
  _renderer: ElementRef | any;

  @Input({ alias: 'media-url' })
  public get media_url(): string | undefined {
    return this._media_url;
  }
  public set media_url(value: string | undefined) {
    if (value === this._media_url) {
      return ;
    }

    if (value === undefined) {

      return ;
    }

    this._media_url = value;
    this._elapsedTime = 0;
    this._tillTime = 0;
  }

  public get playing(): boolean {
    return this._playing;
  }

  public get trackTime(): { elapsed: number, till: number } {
    return {
      elapsed: this._elapsedTime,
      till: this._tillTime
    };
  }

  @Output()
  public trackChanged: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public trackTimeChanged: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _http: HttpClient) {    
  }

  ngOnInit(): void {
    ;
  }

  public play(): Promise<void> {
    if (this._playing) {
      return Promise.resolve();
    }

    this._playing = true;

    return this.requestMedia();
  }

  public stop(): void {
    if (!this._playing) {
      return ;
    }

    this._playing = false;
    
    clearInterval(this._timerid);
    this._timerid = undefined;

    this._startTime = this._audioContext.currentTime;
    this._audioBuffer.stop(this._startTime);
    this._audioAnalyser.disconnect();
    this._audioBuffer.disconnect();
    this._audioAnalyser = null;
    this._audioBuffer = null;
  }

  private requestMedia(): Promise<void> {
    return new Promise((resolve, reject) => {

      if (!this._initialized) {
        this._audioContext = new AudioContext();
        this._initialized = true;
        this._startTime = 0;
      }

      this._http.get(this._media_url, { responseType: "arraybuffer" }).subscribe(
        (buffer: ArrayBuffer) => {
          this._audioContext.decodeAudioData(buffer, (data) => {
            
            const { duration } = this.createAudio(data);
            console.log(`Media: '${this._media_url}' duration: ${duration} sec.`);
            
            resolve();

            this.requestRender();

          });
        },
        error => reject(error)
      );  
    });
  }

  private createAudio(buffer: AudioBuffer): { duration: number } {
    this._audioAnalyser = this._audioContext.createAnalyser();
    this._audioBuffer = this._audioContext.createBufferSource();
    this._audioBuffer.buffer = buffer;

    this._audioBuffer.connect(this._audioAnalyser);
    this._audioAnalyser.connect(this._audioContext.destination);    
    this._startTime = this._audioContext.currentTime;  
    this._trackDuration = buffer.duration;
    this._audioBuffer.start(this._startTime);

    const callback = (() => this.setCurrentTime(this._audioContext.currentTime)).bind(this);

    this._timerid = setInterval(callback, 200);

    return {
      duration: buffer.duration
    };
  }

  private requestRender(): void {
    this._renderContext = this._renderer.nativeElement.getContext('2d');
    this.renderFrame();
  }

  private renderFrame(): void {
    if (!this._audioAnalyser) {
      return ;
    }

    const fbc_array = new Uint8Array(this._audioAnalyser.frequencyBinCount);
    const width = this._renderer.nativeElement.width;
    const height = this._renderer.nativeElement.height;
    
    this._audioAnalyser.getByteFrequencyData(fbc_array);
    this._renderContext.clearRect(0, 0, width, height);
    this._renderContext.fillStyle = "#00CCFF";
    
    const bars = 100;
    
    for (var i = 0; i < bars; i++){
      const bar_x = i * 3;
      const bar_width = 2;
      const bar_height = -(fbc_array[i]/2);

      this._renderContext!.fillRect(bar_x, height, bar_width, bar_height);

    }

    window.requestAnimationFrame(this.renderFrame.bind(this));
  }

  private setCurrentTime(value: number | any): void {
    this._elapsedTime = value - this._startTime;
    this._tillTime = this._trackDuration - this._elapsedTime;
    this.trackTimeChanged.emit();
  }
}
