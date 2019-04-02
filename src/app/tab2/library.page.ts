import { AudioPlayerComponent } from './../core/components/audio-player/audio-player.component';
import { AuthService } from './../core/services/auth.service';
import { SongType } from './../core/models/song.model';
import { HelperService } from './../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { SongService } from '../core/services/song.service';
import { Song } from '../core/models/song.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController, Platform, NavController } from '@ionic/angular';
import { MusicPlayerComponent } from '../core/components/music-player/music-player.component';
import { Router } from '@angular/router';

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
    private navCtrl: NavController,
    private platform: Platform,
    private router: Router,
    public songService: SongService
    ) {
  }

  ngOnInit() {
    this.getSongsFromDB();
  }

  doRefresh(event): void {
    this.normalSongs = [];
    this.instrumentalSongs = [];
    this.backgroundVocalsSongs = [];
    this.otherSongs = [];
    this.songsToDownload = [];
    this.getSongsFromFirebase(event);
  }

  downloadSong(song: Song, index: number): void {
    this.helper.presentLoading('Downloading Song');
    this.songService.downloadSongAudio(song).then((audioEntry) => {
      song.audioPath = audioEntry.toURL();
      // Not using downloaded image right but can since people will have it
      this.songService.downloadSongImage(song).then((imageEntry) => {
        song.imagePath = imageEntry.toURL();
        switch (song.songType) {
          case SongType.Normal:
            this.normalSongs.push(song);
            this.normalSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
            break;
          case SongType.Instrumental:
            this.instrumentalSongs.push(song);
            this.instrumentalSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
            break;
          case SongType.BackgroundVocals:
            this.backgroundVocalsSongs.push(song);
            this.backgroundVocalsSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
            break;
          case SongType.Other:
            this.otherSongs.push(song);
            this.otherSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
            break;
          default:
            alert('Invalid Song Type');
        }
        this.songsToDownload.splice(index, 1);
        this.saveSongs();
        this.helper.dismissLoading();
      }).catch(error => {
        alert(JSON.stringify(error));
        this.helper.dismissLoading();
      });
    }).catch(error => {
      alert(JSON.stringify(error));
      this.helper.dismissLoading();
    });
  }

  filterSongsByReleaseDate(songs: Song[], refreshEvent?): void {
    if (!this.auth.user.planType) {
      this.logout();
    }

    const currentDate = new Date();
    // If it's a subscription user they only have access to songs since their signup date
    let formattedDate: Date;
    if  (this.auth.user.signUpDate.includes('UTC')) {
      const arr = this.auth.user.signUpDate.split(/[- :]/);
      formattedDate = new Date(+arr[0], +arr[1]-1, +arr[2], +arr[3], +arr[4], +arr[5]);
    } else {
      formattedDate = new Date(this.auth.user.signUpDate);
    }
    console.log(formattedDate);
    // subscription is for MemberSpace and month is for Memberful
    if (this.auth.user.planType === 'subscription' || this.auth.user.planType === 'month') {
      const songsInMonth = songs.filter(song => new Date(song.releaseDate).getMonth() === formattedDate.getMonth()
        && new Date(song.releaseDate).getFullYear() === formattedDate.getFullYear());
      songs = songs.filter(song => new Date(song.releaseDate) > formattedDate);
      songs = songs.concat(songsInMonth);
    } else if ((this.auth.user.planType === 'charge' || this.auth.user.planType === 'year') && !this.auth.user.planName.includes('Early')) {
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
    if (refreshEvent) {
      refreshEvent.target.complete();
    }
  }

  getSongsFromDB(): void {
    this.nativeStorage.getItem('songs').then(dbSongs => {
      this.allSongs = dbSongs;
      this.getSongsFromFirebase();
    }).catch(() => {
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(refreshEvent?): void {
    const songSub = this.songService.getSongs().subscribe(apiSongs => {
      this.addNewSongs(apiSongs);
      if (refreshEvent) {
        this.filterSongsByReleaseDate(this.allSongs, refreshEvent); // All Songs may just be dbSongs
      } else {
        this.filterSongsByReleaseDate(this.allSongs); // All Songs may just be dbSongs
      }
      songSub.unsubscribe();
    }, error => {
      alert(error);
      if (refreshEvent) {
        this.filterSongsByReleaseDate(this.allSongs, refreshEvent); // All Songs may just be dbSongs
      } else {
        this.filterSongsByReleaseDate(this.allSongs); // All Songs may just be dbSongs
      }
      songSub.unsubscribe();
    });
  }

  removeSong(songList: Song[], index: number): void {
    songList.splice(index, 1);
    this.saveSongs();
  }

  async selectSong(songs: Song[], selectedIndex: number) {
    if (this.platform.is('ios')) {
      const modal = await this.modalCtrl.create({
        component: AudioPlayerComponent,
        componentProps: {
          'songs': songs,
          'activeIndex': selectedIndex
        }
      });
      modal.onDidDismiss().then(() => {
        this.selectedSong = new Song();
      });
      return await modal.present();
    } else if (this.platform.is('android')) {
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

  private logout(): void {
    this.auth.logout();
    this.navCtrl.navigateRoot('/login');
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
