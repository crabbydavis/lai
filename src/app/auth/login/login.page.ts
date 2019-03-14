import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AuthService } from './../../core/services/auth.service';
import { HelperService } from './../../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, Platform } from '@ionic/angular';
import { SignupComponent } from 'src/app/core/components/signup/signup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';
  hideOverlay = true;

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private helper: HelperService,
    private modalCtrl: ModalController,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.nativeStorage.getItem('showedOverlay').then(res => {
        if (res) {
          this.hideOverlay = true;
          setTimeout(() => {
            this.splashScreen.hide();
          }, 5000);
        }
      }).catch(error => {
        this.hideOverlay = false;
        this.nativeStorage.setItem('showedOverlay', true);
      });
    });
  }

  closeOverlay(): void {
    this.hideOverlay = true;
  }

  async firstTimeLogin() {
    const modal = await this.modalCtrl.create({
      component: SignupComponent,
    });
    modal.onDidDismiss().then(() => {
      this.router.navigate(['/']);
    });
    return await modal.present();
  }

  login(): void {
    this.helper.presentLoading();
    this.auth.login('t@t.com', 'nothanks').then(() => {
      // check if in cancels list first?
      this.auth.getCancelsFromDB(this.email).subscribe(res => {
        if (res.length === 0) {
          this.auth.login(this.email, this.password).then(res => {
            this.router.navigate(['/']);
            this.helper.dismissLoading();
          }).catch(error => {
            console.log('hit error');
            console.log(error);
            this.auth.logout();
            this.helper.dismissLoading();
            this.helper.presentToast('Email or password is incorrect');
          });
        } else {
          this.auth.logout();
          this.helper.presentToast('Your subscription has been cancelled');
          this.helper.dismissLoading();
        }
      }, error => {
        console.log('error trying to get cancels');
        // this.helper.presentToast('Your subscription has been cancelled');
      });
    });
  }

  async resetPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Password via Email',
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.auth.resetPassword(data.email);
            this.helper.presentToast('Password reset email sent');
          }
        }
      ]
    });

    await alert.present();
  }
}
