import { Song } from './../../models/song.model';
import { AuthService } from '../../services/auth.service';
import { SongService } from '../../services/song.service';
import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
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
export class MusicPlayerComponent implements OnInit, AfterViewInit {
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
  private allMusicPlayers: MediaObject[] = [];
  private musicPlayer: MediaObject;
  private readonly skipLength = 30000;
  private readonly msInSec = 1000;

  constructor(
    private auth: AuthService,
    private file: File,
    private cdr: ChangeDetectorRef,
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

  changeSong(): void {
    console.log('change song');
    if (!this.reachedEndOfSong) {
      console.log('changing song in changeSong');
      if  (this.musicPlayer) {
        this.musicPlayer.stop();
        this.musicPlayer.release();
        this.slides.getActiveIndex().then(index => {
          this.activeIndex = index;
          this.activeSong = this.songs[index];
          console.log(this.activeSong);
          this.playSong(true);
        });
      } else {
        this.slides.getActiveIndex().then(index => {
          this.activeSong = this.songs[index];
          console.log(this.activeSong);
          this.playSong();
        });
      }
    } else {
      this.reachedEndOfSong = false;
    }
  }

  dismiss(): void {
    console.log('trying to dismiss modal');
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
    console.log('dragging slide');
    this.didDragSlide = true;
  }

  rewind(): void {
    this.musicPlayer.getCurrentPosition().then(position => {
      console.log(position);
      let newPosition = position * this.msInSec - this.skipLength;
      if (newPosition < 0) {
        newPosition = 0;
      }
      this.musicPlayer.seekTo(newPosition);

      // clearTimeout(this.nextSongTimer);
      // this.nextSongTimer = setTimeout(() => {
      //   this.playNextSong();
      //   console.log('timer expired');
      // }, (this.musicPlayer.getDuration() - position - 3) * 1000);
    });
  }

  fastForward(): void {
    this.musicPlayer.getCurrentPosition().then(position => {
      console.log(position);
      const newPosition = position * this.msInSec + this.skipLength;
      this.musicPlayer.seekTo(newPosition);

      // clearTimeout(this.nextSongTimer);
      // this.nextSongTimer = setTimeout(() => {
      //   this.playNextSong();
      //   console.log('timer expired');
      // }, (this.musicPlayer.getDuration() - position - 3) * 1000);
    });
  }

  pauseSong(): void {
    this.musicPlayer.pause();
    this.songPlaying = false;
    console.log('pause song');
  }

  playSong(nextSong?: boolean): void {
    console.log('in playDownloadedSong');
    this.songPlaying = true;

    if (this.musicPlayer && !nextSong) {
      this.musicPlayer.play({ playAudioWhenScreenIsLocked : true });  // param specified for ios , numberOfLoops: 2
    } else {

      let mediaUrl = this.activeSong.audioPath;
      if (this.platform.is('ios')) {
        mediaUrl = '../Library/NoCloud/' + mediaUrl.split('/').pop();
      }
      console.log(mediaUrl);
      // let fileName = this.activeSong.title.replace(/[^A-Za-z]/g, '');
      // fileName += '.svg';
      // this.file.readAsDataURL(this.file.dataDirectory, fileName).then(res => {
      //   console.log('data url');
      //   console.log(res);
      // });
      // console.log(this.activeSong.imagePath);
      this.musicPlayer = this.media.create(mediaUrl);

      // this.nextSongTimer = setTimeout(() => {
      //   this.playNextSong();
      //   console.log('timer expired');
      // }, (this.musicPlayer.getDuration() - 3) * 1000);

      this.musicPlayer.onStatusUpdate.subscribe((status: number) => {
        console.log(status);
        if (status === MediaStatus.Stopped) {
          console.log('*** media stopped ***');
          if (!this.didDragSlide) {
            console.log('changing song in music player on success');
            this.reachedEndOfSong = true;
            // this.musicPlayer.stop();
            // this.musicPlayer.release();
            if (!this.inDismiss) {
              this.activeIndex += 1;
              if (this.activeIndex >= this.songs.length) {
                this.activeIndex = 0;
              }
              this.activeSong = this.songs[this.activeIndex];
              this.slides.slideTo(this.activeIndex);
              // this.cdr.detectChanges();
              this.playSong(true);
            }
          }
          this.didDragSlide = false;
        }
        if (status === MediaStatus.Running) {
          console.log('$$$ media started $$$');
        }
      }); // fires when file status changes

      this.musicPlayer.onSuccess.subscribe(() => {
        console.log('Action is successful');
        console.log(this.didDragSlide);

        // if (!this.didDragSlide) {
        //   this.slides.isEnd().then(isEnd => {
        //     if (isEnd) {
        //       this.slides.slideTo(0);
        //     } else {
        //       this.slides.slideNext();
        //     }
        //   });
        // }
        // this.didDragSlide = false;
        // if (!this.didDragSlide) {
        //   console.log('changing song in music player on success');
        //   this.reachedEndOfSong = true;
        //   this.musicPlayer.stop();
        //   this.musicPlayer.release();
        //   if (!this.inDismiss) {
        //     this.activeIndex += 1;
        //     if (this.activeIndex >= this.songs.length) {
        //       this.activeIndex = 0;
        //     }
        //     this.activeSong = this.songs[this.activeIndex];
        //     this.slides.slideTo(this.activeIndex);
        //     this.cdr.detectChanges();
        //     this.playSong(true);
        //   }
        // }
        // this.didDragSlide = false;
      });

      this.musicPlayer.onError.subscribe(error => console.log('Error!' + JSON.stringify(error)));

      this.musicPlayer.play({ playAudioWhenScreenIsLocked : true }); // param specified for ios , numberOfLoops: 2
    }
  }

  private playNextSong(): void {
    if (!this.didDragSlide) {
      console.log('changing song in music player on success');
      this.reachedEndOfSong = true;
      // this.musicPlayer.stop();
      // this.musicPlayer.release();
      if (!this.inDismiss) {
        this.activeIndex += 1;
        if (this.activeIndex >= this.songs.length) {
          this.activeIndex = 0;
        }
        this.activeSong = this.songs[this.activeIndex];
        this.slides.slideTo(this.activeIndex);
        // this.cdr.detectChanges();
        this.playSong(true);
      }
    }
    this.didDragSlide = false;
  }
}
