import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TrackService } from '../../services/track.service';
import { Track } from '../../models/track';
import { DurationPipe } from '../../pipes/duration.pipe';
import { PlaylistComponent } from '../playlist/playlist.component';
import { MediaPlayerComponent } from '../mediaplayer/mediaplayer.component';

@Component({
  selector: 'player',
  standalone: true,
  imports: [
    DurationPipe,
    PlaylistComponent,
    MediaPlayerComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.less'
})
export class PlayerComponent implements OnInit {
  title = 'player';
  
  private _tracks: Track[] = [];
  private _currentTrackTime: number = 0;
  private _leastTrackTime: number = 0;

  get currentTrackTime(): number {
    return this._currentTrackTime;
  }

  get leastTrackTime(): number {
    return this._leastTrackTime;
  }

  @ViewChild(MediaPlayerComponent)
  _mediaPlayer: MediaPlayerComponent | any;

  @ViewChild(PlaylistComponent)
  private _playlist: PlaylistComponent | any;

  get tracks(): Track[] {
    return this._tracks;
  }
  
  constructor(
    private _trackService: TrackService,
    private _changeDetector: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this._trackService.getTracks().subscribe(data => {        
      let tracks: Track[] = [];

      data.tracks.forEach(track => {
        tracks.push({
          title: track.title,
          media: track.media
        });
      });
      
      this._tracks = tracks;
    });
  }

  onCurrentTrackIndexChanged(): void {
    const trackIndex: number = this._playlist.currentIndex;

    if (0 > trackIndex) {
      return ;
    }
    
    const track: Track = this._tracks[trackIndex];
    const media_url = `http://localhost:3000/audio/${track.media}`;

    if (this._mediaPlayer.media_url != media_url) {
      this._mediaPlayer.stop();

      this._mediaPlayer.media_url = media_url;
      this._mediaPlayer.play().then(() => {
        
        console.log('[PlayerComponent] Playing');

      });
    }
  }

  onTrackTimeChanged(): void {
    const { elapsed, till } = this._mediaPlayer.trackTime;
    this._currentTrackTime = elapsed;
    this._leastTrackTime = till;
    this._changeDetector.detectChanges();
  }

  onPreviousTrackClick($event: MouseEvent): void {
    ;
  }

  onPlayClick($event: MouseEvent): void {
    if (!this._mediaPlayer.playing) {
      if ((undefined === this._mediaPlayer.media_url) && (0 < this._tracks.length)) {
        this._playlist.currentIndex = 0;
        return ;
      }

      this._mediaPlayer.play();
    }
    else {
      this._mediaPlayer.stop();
    }
  }

  onNextTrackClick($event: MouseEvent): void {
    ;
  }
}
