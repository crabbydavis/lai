import { Song } from './../../models/song.model';
import { AuthService } from '../../services/auth.service';
import { SongService } from '../../services/song.service';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { Platform, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss']
})
export class MusicPlayerComponent implements OnInit {
  @Input() songs: Song[];
  @Input() activeIndex: number;

  activeSong: Song;
  songPlaying = false;
  songUrl: any;
  inDismiss = false;
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

  rewind(): void {
    this.musicPlayer.getCurrentPosition().then(position => {
      console.log(position);
      let newPosition = position * this.msInSec - this.skipLength;
      if (newPosition < 0) {
        newPosition = 0;
      }
      this.musicPlayer.seekTo(newPosition);
    });
  }

  fastForward(): void {
    this.musicPlayer.getCurrentPosition().then(position => {
      console.log(position);
      const newPosition = position * this.msInSec + this.skipLength;
      this.musicPlayer.seekTo(newPosition);
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
      this.musicPlayer.play({ playAudioWhenScreenIsLocked : true });  // param specified for ios
    } else {

      let mediaUrl = this.activeSong.audioPath;
      if (this.platform.is('ios')) {
        mediaUrl = '../Library/NoCloud/' + mediaUrl.split('/').pop();
      }
      console.log(mediaUrl);
      this.musicPlayer = this.media.create(mediaUrl);

      this.musicPlayer.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes

      this.musicPlayer.onSuccess.subscribe(() => {
        console.log('Action is successful');
        console.log('song finished');
        // this.musicPlayer.stop();
        // this.musicPlayer.release();
        if (!this.inDismiss) {
          this.activeIndex += 1;
          if (this.activeIndex >= this.songs.length) {
            this.activeIndex = 0;
          }
          this.activeSong = this.songs[this.activeIndex];
          this.cdr.detectChanges();
          console.log(this.activeIndex);
          console.log(this.activeSong);
          this.playSong(true);
        }
      });

      this.musicPlayer.onError.subscribe(error => console.log('Error!', error));

      this.musicPlayer.play({ playAudioWhenScreenIsLocked : true }); // param specified for ios
    }
  }
}
