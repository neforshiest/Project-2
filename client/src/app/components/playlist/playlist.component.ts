import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, numberAttribute } from '@angular/core';
import { NgIf, NgFor, NgForOf } from '@angular/common';
import { Track } from '../../models/track';

@Component({
  selector: 'playlist',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgForOf
  ],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.less'
})
export class PlaylistComponent implements OnInit, AfterViewInit {

  private _currentIndex: number = -1;
  private _tracks: Track[] = [];

  @Input({ alias: 'tracks' })
  public get tracks(): Track[] {
    return this._tracks;
  }
  public set tracks(value: Track[]) {
    this._tracks = value;
    this.tracksChanged.emit();
    
    this.currentIndex = -1;
  }

  @Input({ alias: 'current-index', transform: numberAttribute })
  public get currentIndex(): number {
    return this._currentIndex;
  }
  public set currentIndex(value: number) {
    if (this._currentIndex == value) {
      return ;
    }

    this._currentIndex = value;
    this.currentIndexChanged.emit();
  }

  @Output()
  public tracksChanged = new EventEmitter<void>();

  @Output()
  public currentIndexChanged = new EventEmitter<void>();

  ngAfterViewInit(): void {
    console.log('PlaylistComponent.ngAfterViewInit()');
  }

  ngOnInit(): void {
    console.log('PlaylistComponent.ngOnInit()');
  }

  onTrackClick(track: Track): void {
    const index = this._tracks.findIndex((value: Track) => track == value);
    this.currentIndex = index;
  }
}
