import { HelperService } from './helper.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Song } from '../models/song.model';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

@Injectable({ providedIn: 'root' })
export class SongService {

  song: Blob;
  meta: Observable<any>;

  songsCollection: AngularFirestoreCollection<Song>;

  constructor(
    private file: File,
    private helper: HelperService,
    private transfer: FileTransfer,
    private db: AngularFirestore,
    private nativeStorage: NativeStorage,
    private storage: AngularFireStorage
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
    console.log(fileName);
    const fileTransfer: FileTransferObject = this.transfer.create();
    // const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
    // this.soundPath = entry.toURL();
    return fileTransfer.download(song.audioUrl, this.file.dataDirectory + fileName);
  }

  downloadSongImage(song: Song): Promise<any> {
    let fileName = song.title.replace(/[^A-Za-z]/g, '');
    fileName += '.svg';
    console.log(fileName);
    const fileTransfer: FileTransferObject = this.transfer.create();
    // const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
    // this.soundPath = entry.toURL();
    return fileTransfer.download(song.imageUrl, this.file.dataDirectory + fileName);
  }

  // Not using right now but should figure out since file transfer plugin is deprecated
  downloadSong(): void {
  //   console.log('in downloadSong');
  //   // const fileTransfer: FileTransferObject = this.transfer.create();

  //   const ref = this.storage.ref(`/audio/2014-12-006-youll-never-run-out-of-love-256k-eng.mp3`);
  //   this.meta = ref.getMetadata();
  //   this.meta.subscribe(res => {
  //     console.log(res);
  //   });

  //   // const httpsReference = this.storage.refFromURL('https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg');
    const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
    console.log(url);
    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;
      this.song = xhr.response;
      // console.log('Got Song: ' + this.song);
      console.log(this.song.size);
      console.log(this.song.type);

      const folderPath = this.file.dataDirectory;
      console.log(this.file.dataDirectory);
      this.file.listDir('file:///', folderPath).then((dir: any) => {
        dir.getFile('song.mp3', {create:true}, (file) => {
            file.createWriter((fileWriter) => {
                fileWriter.write(blob);
                fileWriter.onwrite = () => {
                    console.log('File written successfully.');
                }
            }, () => {
                alert('Unable to save file in path '+ folderPath);
            });
        });
    });

    //   window.resolveLocalFileSystemURL(this.file.dataDirectory, (dir) => {
    //     console.log("Access to the directory granted succesfully");
    //     dir.getFile(filename, {create:true}, function(file) {
    //         console.log("File created succesfully.");
    //         file.createWriter(function(fileWriter) {
    //             console.log("Writing content to file");
    //             fileWriter.write(DataBlob);
    //         }, function(){
    //             alert('Unable to save file in path '+ folderpath);
    //         });
    //     });
    // });



      // const reader = new FileReader();
      // reader.onloadend = (event) => {

      //   const base64FileData = reader.result.toString();
      //   console.log('reading file');
      //   console.log(base64FileData);
      //   window.resolveLocalFileSystemURL(this.file.dataDirectory, (d: any) => {
      //     window.resolveLocalFileSystemURL(base64FileData, (fe) => {
      //       fe.copyTo(d, 'song', (e) => {
      //         console.log('success inc opy');
      //         console.dir(e);
      //         this.soundFile = e.nativeURL;
      //         this.soundPath = e.fullPath;
      //         console.debug(this.soundPath);
        
      //         // Sounds.save($scope.sound).then(function() {
      //         //   $ionicHistory.nextViewOptions({
      //         //       disableBack: true
      //         //   });
      //         //   $state.go("home");
      //         // });
              
      //       }, function(e) {
      //         console.log('error in coipy');console.dir(e);
      //       });					
      //     }, function(e) {
      //       console.log("error in inner bullcrap");
      //       console.dir(e);
      //     });
      //   });
      //   // this.nativeStorage.setItem('song', base64FileData).catch(error => console.error(error));
      //   // console.log(event.target.result);
      //   // var mediaFile = {
      //   //   fileUrl: audioFileUrl,
      //   //   size: blob.size,
      //   //   type: blob.type,
      //   //   src: base64FileData
      //   // };
      // };

      // reader.readAsDataURL(blob);
    };
    xhr.open('GET', url);
    xhr.send();
    console.log('going to download song');
  }
  
//   downloadSongFileWay(): void {
//     window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, (fs) => {

//       console.log('file system open: ' + fs.name);
//       this.getSampleFile(fs.root);
  
//     }, (error) => console.log(error));
//   }

//   getSampleFile(dirEntry) {
//   //   // const httpsReference = this.storage.refFromURL('https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg');
//   const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2F2014-12-006-youll-never-run-out-of-love-256k-eng.mp3?alt=media&token=4df61b56-ede0-45b3-abc4-460a4d17cb11`;
//   console.log(url);
//   // This can be downloaded directly:
//   const xhr = new XMLHttpRequest();
//   xhr.responseType = 'blob';
//   xhr.onload = (event) => {
//     const blob = xhr.response;
//     this.song = xhr.response;
//     console.log('Got Song: ' + this.song);
//     console.log(this.song.size);
//     console.log(this.song.type);

//     this.saveFile(dirEntry, blob, 'downloadedSong.mp3');

//   //   window.resolveLocalFileSystemURL(this.file.dataDirectory, (dir) => {
//   //     console.log("Access to the directory granted succesfully");
//   //     dir.getFile(filename, {create:true}, function(file) {
//   //         console.log("File created succesfully.");
//   //         file.createWriter(function(fileWriter) {
//   //             console.log("Writing content to file");
//   //             fileWriter.write(DataBlob);
//   //         }, function(){
//   //             alert('Unable to save file in path '+ folderpath);
//   //         });
//   //     });
//   // });
//     };
//   xhr.open('GET', url);
//   xhr.send();
// }

//   saveFile(dirEntry, fileData, fileName) {

//     dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {

//         this.writeFile(fileEntry, fileData);

//     }, (error) => console.log(error));
//   }

//   writeFile(fileEntry, dataObj) {

//     // Create a FileWriter object for our FileEntry (log.txt).
//     fileEntry.createWriter((fileWriter) => {

//         fileWriter.onwriteend = () => {
//             console.log("Successful file write...");
//             if (dataObj.type == "image/png") {
//                 readBinaryFile(fileEntry);
//             }
//             else {
//                 readFile(fileEntry);
//             }
//         };

//         fileWriter.onerror = function(e) {
//             console.log("Failed file write: " + e.toString());
//         };

//         fileWriter.write(dataObj);
//     });
//   }

//   readBinaryFile(fileEntry) {

//     fileEntry.file(function (file) {
//         var reader = new FileReader();

//         reader.onloadend = function() {

//             console.log("Successful file write: " + this.result);
//             displayFileData(fileEntry.fullPath + ": " + this.result);

//             var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
//             displayImage(blob);
//         };

//         reader.readAsArrayBuffer(file);

//     }, onErrorReadFile);
//   }
}
