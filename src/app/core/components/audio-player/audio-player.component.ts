import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HelperService } from './../../services/helper.service';
// import { AudioService } from './../../services/audio.service';
import { Song } from './../../models/song.model';
import { SongService } from '../../services/song.service';
import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
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
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {
  @Input() songs: Song[];
  @Input() activeIndex: number;
  @ViewChild(IonSlides) slides: IonSlides;

  cdvAudioPlayer: any;
  startedPlaying = false;
  songPlaying = false;
  reachedEndOfSong = false;
  nextSongTimer: any;
  currentTrack = '';
  isLoading = false;
  private readonly skipLength = 30;

  constructor(
    private cdr: ChangeDetectorRef,
    private file: File,
    private helper: HelperService,
    private modalCtrl: ModalController,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    public songService: SongService,
    // private cdvAudioPlayer: AudioService
  ) { }

  ngOnInit() {
    this.nativeStorage.setItem('donePlaying', false);

    this.platform.resume.subscribe(() => {
      this.nativeStorage.getItem('donePlaying').then(res => {
        if (res) {
          this.dismiss();
        }
      });
    });

    this.helper.presentLoading();
    this.cdvAudioPlayer.setOptions({ verbose: true, resetStreamOnPause: true }).then(() => {
      const playlist = [];
      this.songs.forEach(song => {
        let fileName = song.title.replace(/[^A-Za-z]/g, '');
        fileName += '.mp3';
        const mediaUrl = this.file.dataDirectory.concat(fileName);
        playlist.push({
          trackId: song.title,
          assetUrl: mediaUrl,
          albumArt: song.imageUrl,
          artist: 'Hilary Weeks',
          album: 'None',
          title: song.title
        });
      });
      this.cdvAudioPlayer.setPlaylistItems(playlist).then(() => {
        this.cdvAudioPlayer.playTrackByIndex(this.activeIndex);
        if (this.activeIndex !== 0) {
          this.reachedEndOfSong = true;
          console.log('80 setting reached end of song to true');
        }
        this.slides.slideTo(this.activeIndex);
        this.songPlaying = true;
        this.helper.dismissLoading();
      }).catch((err) => console.log('YourService, cdvAudioPlayer setPlaylistItems error: ', err));
    }).catch((err) => console.log('YourService, cdvAudioPlayer init error: ', err));

   this.cdvAudioPlayer.setOptions({ verbose: false, resetStreamOnPause: true });
   this.cdvAudioPlayer.setVolume(0.5);
   this.cdvAudioPlayer.setLoop(true);

   this.cdvAudioPlayer.onStatus.subscribe((status: any) => {
    //  console.log('YourService: Got RmxAudioPlayer onStatus: ', status);
    this.isLoading = false;
    if (!this.startedPlaying) {
      this.startedPlaying = true;
    }

     if (this.currentTrack) {
       if (this.currentTrack !== status.trackId) {
         this.slides.slideNext();
        //  console.log('108 setting reached end of song to true');
         this.reachedEndOfSong = true;
       }
     }
     if (status.trackId === undefined || status.trackId === 'INVALID') {
      this.nativeStorage.setItem('donePlaying', true);
      // if (this.startedPlaying) {
      //   this.cdvAudioPlayer.playTrackByIndex(0);
      //   this.activeIndex = 0;
      //   this.songPlaying = true;
      //   console.log('116 setting reached end of song to true');
      //   this.reachedEndOfSong = true;
      //   this.slides.slideTo(0);
      // }
     }
   });
  }

  changeSong(): void {
    // console.log('change song: ' + this.reachedEndOfSong);
    if (!this.reachedEndOfSong) {
      // this.helper.presentLoading();
      this.isLoading = true;
      // console.log('present loading: ' + this.isLoading);
      // this.slides.lockSwipes(true);
      this.slides.getActiveIndex().then(index => {
        this.activeIndex = index;
        this.cdvAudioPlayer.playTrackByIndex(this.activeIndex);
        this.songPlaying = true;
      });
    } else {
      this.reachedEndOfSong = false;
    }
  }

  dismiss(): void {
    this.cdvAudioPlayer.clearAllItems();
    this.modalCtrl.dismiss();
  }

  getImage(imageUrl): void {
    // let fileName = this.activeSong.title.replace(/[^A-Za-z]/g, '');
    // fileName += '.svg';
    // this.file.readAsDataURL(this.file.dataDirectory, this.activeSong).then()
  }

  rewind(): void {
    this.cdvAudioPlayer.getPosition().then((position: number) => {
      const newPosition = position - this.skipLength;
      this.cdvAudioPlayer.seekTo(newPosition);
    });
  }

  fastForward(): void {
    this.cdvAudioPlayer.getPosition().then((position: number) => {
      console.log(position);
      const newPosition = position + this.skipLength;
      this.cdvAudioPlayer.seekTo(newPosition);
    });
  }

  pauseSong(): void {
    this.cdvAudioPlayer.pause();
    this.songPlaying = false;
  }

  playSong(): void {
    this.cdvAudioPlayer.play();
    this.songPlaying = true;
  }
}
