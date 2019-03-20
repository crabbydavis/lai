import { User } from 'src/app/core/models/user.model';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AuthService } from './../../core/services/auth.service';
import { HelperService } from './../../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, Platform } from '@ionic/angular';
import { SignupComponent } from 'src/app/core/components/signup/signup.component';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';
  hideOverlay = true;
  private readonly maxDeviceLength = 6;

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private device: Device,
    private helper: HelperService,
    private modalCtrl: ModalController,
    private nativeStorage: NativeStorage,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      console.log('enter login');
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
    // this.auth.login('t@t.com', 'nothanks').then(() => {
    this.auth.loginAnonymously().then(() => {
      // check if in cancels list first?
      this.auth.getCancelsFromDB(this.email).subscribe(res => {
        if (res.length === 0) {
          this.auth.getUserByEmail(this.email).subscribe(doc => {
            const user: User = doc.data();
            if (user === undefined || user === null) {
              this.auth.deleteUser();
              this.auth.logout();
              this.helper.dismissLoading();
              this.helper.presentToast('Email or password is incorrect');
            } else {
              if (user.devices === null || user.devices === undefined) {
                user.devices = [];
              }
              if (user.devices.length === this.maxDeviceLength) {
                this.helper.presentToast(`Your subscription has reached the maximum number of devices.
                  Please contact information@hilaryweeks.com for more information.`);
                this.auth.deleteUser();
                this.auth.logout();
                this.helper.dismissLoading();
              } else {
                const newDevice = this.device.platform + '-' + this.device.model + '-' + this.device.manufacturer + '-' + this.device.uuid;
                if (!user.devices.includes(newDevice)) {
                  user.devices.push(newDevice);
                  this.auth.updateUser(user).then(() => {
                    console.log('User Updated');
                  }).catch(error => {
                    console.log('user not updated', error);
                  });
                }
                // delete the anonymous user
                this.auth.deleteUser().then(() => {
                  this.auth.login(this.email, this.password).then(token => {
                    console.log(res);
                    this.router.navigate(['/']);
                    this.helper.dismissLoading();
                  }).catch(error => {
                    console.log('hit error');
                    console.log(error);
                    this.auth.deleteUser();
                    this.auth.logout();
                    this.helper.dismissLoading();
                    this.helper.presentToast('Email or password is incorrect');
                  });
                }).catch(error => {
                  console.log(error);
                });
              }
            }
          }, error => console.error(JSON.stringify(error)));
        } else {
          this.auth.deleteUser();
          this.auth.logout();
          this.helper.presentToast('Your subscription has been cancelled');
          this.helper.dismissLoading();
        }
      }, error => {
        console.log('error trying to get cancels');
        this.auth.deleteUser();
        this.auth.logout();
        this.helper.dismissLoading();
        this.helper.presentToast('Email or password is incorrect');
        // this.helper.presentToast('Your subscription has been cancelled');
      });
    }).catch(error => {
      console.log(error);
      this.helper.dismissLoading();
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
