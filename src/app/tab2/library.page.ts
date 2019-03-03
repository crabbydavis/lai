import { SongType } from './../core/models/song.model';
import { HelperService } from './../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { SongService } from '../core/services/song.service';
import { Song } from '../core/models/song.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
import { MusicPlayerComponent } from '../core/components/music-player/music-player.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'library.page.html',
  styleUrls: ['library.page.scss']
})
export class LibraryPage implements OnInit {

  allSongs: Song[];

  normalSongs: Song[] = [];
  instrumentalSongs: Song[] = [];
  backgroundVocalsSongs: Song[] = [];
  otherSongs: Song[] = [];
  songsToDownload: Song[] = [];

  selectedSong: Song = new Song();

  constructor(
    private helper: HelperService,
    private modalCtrl: ModalController,
    private nativeStorage: NativeStorage,
    public songService: SongService
    ) {
  }

  ngOnInit() {
    this.getSongsFromDB();
    // this.getSongsFromFirebase();


    // const currentDate = new Date();
    // this.nativeStorage.getItem('dateLastFetched').then(res => {
    //   const dbDate = new Date(res);
    //   if (dbDate < currentDate && dbDate.getMonth() !== currentDate.getMonth()) {
    //     this.getSongsFromFirebase();
    //   } else {
    //     this.getSongsFromDB();
    //   }
    // });
  }

  downloadSong(song: Song, index: number): void {
    this.helper.presentLoading('Downloading Song');
    this.songService.fileTransferDownload(song).then((entry) => {
      // console.log('download complete: ' + entry.toURL());
      song.audioPath = entry.toURL();
      console.log('downloaded song');
      console.log(song);
      console.log('song type', song.songType);
      switch (song.songType) {
        case SongType.Normal:
          this.normalSongs.push(song);
          break;
        case SongType.Instrumental:
          this.instrumentalSongs.push(song);
          break;
        case SongType.BackgroundVocals:
          this.backgroundVocalsSongs.push(song);
          break;
        case SongType.Other:
          this.otherSongs.push(song);
          break;
        default:
          alert('Invalid Song Type');
      }
      this.songsToDownload.splice(index, 1);
      this.saveSongs();
      // this.selectSong(song);
      this.helper.dismissLoading();
    });
  }

  filterSongsByReleaseDate(songs: Song[]): void {
    const currentDate = new Date();
    const filteredSongs = songs.filter(song => new Date(song.releaseDate) < currentDate);
    filteredSongs.forEach(song => {
      if (song.audioPath) {
        switch (song.songType) {
          case SongType.Normal:
            this.normalSongs.push(song);
            break;
          case SongType.Instrumental:
            this.instrumentalSongs.push(song);
            break;
          case SongType.BackgroundVocals:
            this.backgroundVocalsSongs.push(song);
            break;
          case SongType.Other:
            this.otherSongs.push(song);
            break;
          default:
            alert('Invalid Song Type');
        }
      } else {
        this.songsToDownload.push(song);
      }
    });
    // this.songs = filteredSongs;
    // console.log(this.songs);
  }

  getSongsFromDB(): void {
    this.nativeStorage.getItem('songs').then(dbSongs => {
      console.log('got songs from db');
      console.log(dbSongs);
      this.filterSongsByReleaseDate(dbSongs);
    }).catch(() => {
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(): void {
    const songSub = this.songService.getSongs().subscribe(apiSongs => {
      console.log(apiSongs);
      this.filterSongsByReleaseDate(apiSongs);
      this.nativeStorage.setItem('songs', apiSongs);
      // this.nativeStorage.setItem('dateLastFetched', new Date().toISOString());
      songSub.unsubscribe();
    });
  }

  async selectSong(songs: Song[], selectedIndex: number) {
    // this.songService.activeSong = song;
    console.log('trying to create modal');
    const modal = await this.modalCtrl.create({
      component: MusicPlayerComponent,
      componentProps: {
        'songs': songs,
        'activeIndex': selectedIndex
      }
    });
    modal.onDidDismiss().then(() => {
      this.selectedSong = new Song();
    });
    return await modal.present();
  }

  private saveSongs(): void {
    const allSongs = this.normalSongs.concat(
      this.instrumentalSongs.concat(this.backgroundVocalsSongs.concat(this.otherSongs.concat(this.songsToDownload)))
    );
    console.log(allSongs);
    this.nativeStorage.setItem('songs', allSongs);
  }
}
