import { Song } from './../../models/song.model';
import { AuthService } from '../../services/auth.service';
import { SongService } from '../../services/song.service';
import { Component, OnInit, Input, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform, ModalController, IonSlides } from '@ionic/angular';

enum MediaStatus {
  None = 0,
  Starting = 1,
  Running = 2,
  Paused = 3,
  Stopped = 4
}

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss']
})
export class MusicPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() songs: Song[];
  @Input() activeIndex: number;
  @ViewChild(IonSlides) slides: IonSlides;

  activeSong: Song;
  songPlaying = false;
  songUrl: any;
  inDismiss = false;
  forceStop = false;
  didDragSlide = false;
  reachedEndOfSong = false;
  nextSongTimer: any;
  private musicPlayer: MediaObject;
  private readonly skipLength = 30000;
  private readonly msInSec = 1000;

  constructor(
    private auth: AuthService,
    private file: File,
    private media: Media,
    private modalCtrl: ModalController,
    private platform: Platform,
    public songService: SongService
  ) { }

  ngOnInit() {
    this.activeSong = this.songs[this.activeIndex];
  }

  ngAfterViewInit() {
    this.slides.slideTo(this.activeIndex);
    if  (this.activeIndex === 0) {
      this.playSong();
    }
  }

  ngOnDestroy() {
    this.inDismiss = true;
    if (this.musicPlayer) {
      this.pauseSong();
      this.musicPlayer.stop();
      this.musicPlayer.release();
    }
  }

  changeSong(): void {
    if (!this.reachedEndOfSong) {
      if (this.musicPlayer) {
        this.musicPlayer.stop();
        this.musicPlayer.release();
        this.slides.getActiveIndex().then(index => {
          this.activeIndex = index;
          this.activeSong = this.songs[index];
          this.playSong(true);
        });
      } else {
        this.slides.getActiveIndex().then(index => {
          this.activeSong = this.songs[index];
          this.playSong();
        });
      }
    } else {
      this.reachedEndOfSong = false;
    }
  }

  dismiss(): void {
    this.inDismiss = true;
    if (this.musicPlayer) {
      this.pauseSong();
      this.musicPlayer.stop();
      this.musicPlayer.release();
    }
    this.modalCtrl.dismiss();
  }

  getImage(imageUrl): void {
    // let fileName = this.activeSong.title.replace(/[^A-Za-z]/g, '');
    // fileName += '.svg';
    // this.file.readAsDataURL(this.file.dataDirectory, this.activeSong).then()
  }

  dragSlide(): void {
    this.didDragSlide = true;
  }

  rewind(): void {
    this.musicPlayer.getCurrentPosition().then(position => {
      let newPosition = position * this.msInSec - this.skipLength;
      if (newPosition < 0) {
        newPosition = 0;
      }
      this.musicPlayer.seekTo(newPosition);
    });
  }

  fastForward(): void {
    this.musicPlayer.getCurrentPosition().then(position => {
      const newPosition = position * this.msInSec + this.skipLength;
      this.musicPlayer.seekTo(newPosition);
    });
  }

  pauseSong(): void {
    this.musicPlayer.pause();
    this.songPlaying = false;
  }

  playSong(nextSong?: boolean): void {
    this.songPlaying = true;

    if (this.musicPlayer && !nextSong) {
      this.musicPlayer.play({ playAudioWhenScreenIsLocked : true });  // param specified for ios , numberOfLoops: 2
    } else {

      let mediaUrl = this.activeSong.audioPath;
      if (this.platform.is('ios')) {
        mediaUrl = '../Library/NoCloud/' + mediaUrl.split('/').pop();
      }
      this.musicPlayer = this.media.create(mediaUrl);

      this.musicPlayer.onStatusUpdate.subscribe((status: number) => {
        if (status === MediaStatus.Stopped) {
          if (!this.didDragSlide) {
            this.reachedEndOfSong = true;
            if (!this.inDismiss) {
              this.activeIndex += 1;
              if (this.activeIndex >= this.songs.length) {
                this.activeIndex = 0;
              }
              this.activeSong = this.songs[this.activeIndex];
              this.slides.slideTo(this.activeIndex);
              this.playSong(true);
            }
          }
          this.didDragSlide = false;
        }
        if (status === MediaStatus.Running) {
          // console.log('$$$ media started $$$');
        }
      }); // fires when file status changes

      this.musicPlayer.onSuccess.subscribe(() => {
      });

      this.musicPlayer.onError.subscribe(error => console.log('Error!' + JSON.stringify(error)));

      this.musicPlayer.play({ playAudioWhenScreenIsLocked : true }); // param specified for ios , numberOfLoops: 2
    }
  }
}
