// Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Cordova Plugins
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

// Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Environment
import { environment } from './../environments/environment';

// Components
import { MusicPlayerComponent } from './core/components/music-player/music-player.component';
import { SignupComponent } from './core/components/signup/signup.component';
// import { environment } from './../environments/environment.prod';


@NgModule({
  declarations: [AppComponent, MusicPlayerComponent, SignupComponent],
  entryComponents: [MusicPlayerComponent, SignupComponent],
  imports: [
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule],
  providers: [
    File,
    FileTransfer,
    InAppBrowser,
    NativeStorage,
    Media,
    MusicControls,
    StreamingMedia,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
