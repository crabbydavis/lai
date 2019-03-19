import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Song } from '../models/song.model';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';

@Injectable({ providedIn: 'root' })
export class SongService {

  song: Blob;
  meta: Observable<any>;

  songsCollection: AngularFirestoreCollection<Song>;

  constructor(
    private file: File,
    private transfer: FileTransfer,
    private db: AngularFirestore,
  ) {
    this.init();
  }

  private init(): void {
    this.songsCollection = this.db.collection<Song>('songs');
  }

  getSongs(): Observable<Song[]> {
    return this.songsCollection.valueChanges();
  }

  downloadSongAudio(song: Song): Promise<any> {
    let fileName = song.title.replace(/[^A-Za-z]/g, '');
    fileName += '.mp3';
    const fileTransfer: FileTransferObject = this.transfer.create();
    return fileTransfer.download(song.audioUrl, this.file.dataDirectory + fileName);
  }

  downloadSongImage(song: Song): Promise<any> {
    let fileName = song.title.replace(/[^A-Za-z]/g, '');
    fileName += '.png';
    const fileTransfer: FileTransferObject = this.transfer.create();
    return fileTransfer.download(song.imageUrl, this.file.dataDirectory + fileName);
  }

  // Not using right now but should figure out since file transfer plugin is deprecated
  // downloadSong(): void {
  //   const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
  //   console.log(url);
  //   // This can be downloaded directly:
  //   const xhr = new XMLHttpRequest();
  //   xhr.responseType = 'blob';
  //   xhr.onload = (event) => {
  //     const blob = xhr.response;
  //     this.song = xhr.response;
  //     // console.log('Got Song: ' + this.song);
  //     console.log(this.song.size);
  //     console.log(this.song.type);

  //     const folderPath = this.file.dataDirectory;
  //     console.log(this.file.dataDirectory);
  //     this.file.listDir('file:///', folderPath).then((dir: any) => {
  //       dir.getFile('song.mp3', {create:true}, (file) => {
  //           file.createWriter((fileWriter) => {
  //               fileWriter.write(blob);
  //               fileWriter.onwrite = () => {
  //                   console.log('File written successfully.');
  //               }
  //           }, () => {
  //               alert('Unable to save file in path '+ folderPath);
  //           });
  //       });
  //   });
  //   };
  //   xhr.open('GET', url);
  //   xhr.send();
  //   console.log('going to download song');
  // }
}
