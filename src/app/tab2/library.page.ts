import { AuthService } from './../core/services/auth.service';
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

  allSongs: Song[] = [];

  normalSongs: Song[] = [];
  instrumentalSongs: Song[] = [];
  backgroundVocalsSongs: Song[] = [];
  otherSongs: Song[] = [];
  songsToDownload: Song[] = [];

  selectedSong: Song = new Song();

  constructor(
    private auth: AuthService,
    private helper: HelperService,
    private modalCtrl: ModalController,
    private nativeStorage: NativeStorage,
    public songService: SongService
    ) {
  }

  ngOnInit() {
    this.getSongsFromDB();
  }

  downloadSong(song: Song, index: number): void {
    this.helper.presentLoading('Downloading Song');
    this.songService.downloadSongAudio(song).then((audioEntry) => {
      song.audioPath = audioEntry.toURL();
      this.songService.downloadSongImage(song).then((imageEntry) => {
        song.imagePath = imageEntry.toURL();
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
        this.helper.dismissLoading();
      });
    });
  }

  filterSongsByReleaseDate(songs: Song[]): void {
    const currentDate = new Date();
    // If it's a subscription user they only have access to songs since their signup date
    if (this.auth.user.planType === 'subscription') {
      songs = songs.filter(song => new Date(song.releaseDate) > new Date(this.auth.user.signUpDate));
    } else if (this.auth.user.planType === 'charge' && !this.auth.user.planName.includes('Early')) {
      songs = songs.filter(song => new Date(song.releaseDate) > new Date('12/31/18'));
    }
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
    this.sortSongs();
  }

  getSongsFromDB(): void {
    this.nativeStorage.getItem('songs').then(dbSongs => {
      this.allSongs = dbSongs;
      this.getSongsFromFirebase();
    }).catch(() => {
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(): void {
    console.log('get songs');
    const songSub = this.songService.getSongs().subscribe(apiSongs => {
      console.log(apiSongs);
      this.addNewSongs(apiSongs);
      console.log(this.allSongs);
      this.filterSongsByReleaseDate(this.allSongs); // All Songs may just be dbSongs
      songSub.unsubscribe();
    });
  }

  async selectSong(songs: Song[], selectedIndex: number) {
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

  private addNewSongs(apiSongs: Song[]): void {
    let addedSong = false;
    apiSongs.forEach(apiSong => {
      let foundSong = false;
      for (let i = 0; i < this.allSongs.length; i++) {
        const song = this.allSongs[i];
        if (apiSong.title === song.title) {
          foundSong = true;
          break;
        }
      }
      if (!foundSong) {
        addedSong = true;
        this.allSongs.push(apiSong);
      }
    });
    if (addedSong) {
      this.nativeStorage.setItem('songs', this.allSongs);
    }
  }

  private saveSongs(): void {
    const allSongs = this.normalSongs.concat(
      this.instrumentalSongs.concat(this.backgroundVocalsSongs.concat(this.otherSongs.concat(this.songsToDownload)))
    );
    this.nativeStorage.setItem('songs', allSongs);
  }

  private sortSongs(): void {
    this.normalSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.instrumentalSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.songsToDownload.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.backgroundVocalsSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.otherSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
  }
}
