import { HelperService } from '../../services/helper.service';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/core/models/user.model';
import { ModalController } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  accountNotFound = false;
  confirmPassword = '';
  email = '';
  password = '';
  canceledSub = false;

  private createdUser = false;

  constructor(
    private authService: AuthService,
    private device: Device,
    private helper: HelperService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    // console.log('in ngOnDestroy');
    // if (!this.createdUser) {
    //   console.log('logging out t@t');
    //   this.authService.logout();
    // }
  }

  closeModal(): void {
    // if (!this.createdUser) {
    //   console.log('logging out t@t');
    //   this.authService.logout();
    // }
    this.modalCtrl.dismiss();
  }

  disableRegister(): boolean {
    if (!this.email || !this.password || !this.confirmPassword || (this.password !== this.confirmPassword)) {
      return true;
    } else {
      return false;
    }
  }

  register(): void {
    this.helper.presentLoading();
    // this.authService.login('t@t.com', 'nothanks').then(() => {
    this.authService.loginAnonymously().then(() => {
      // check if in cancels list first?
      this.authService.getCancelsFromDB(this.email).subscribe(res => {
        if (res.length === 0) {
          this.authService.getUserFromDB(this.email).subscribe(res => {
            // console.log('found user', res);
            const user: User = res[0];
            if (res.length > 0) {
              this.authService.createUser(user, this.password).then(() => {
                this.createdUser = true;
                this.authService.user = user;
                user.devices = [];
                const newDevice = this.device.platform + '-' + this.device.model + '-' + this.device.manufacturer + '-' + this.device.uuid;
                user.devices.push(newDevice);
                this.authService.updateUser(user).then(() => {
                  console.log('User Updated');
                }).catch(error => {
                  console.log('user not updated', error);
                });
                this.modalCtrl.dismiss();
              }).catch(error => {
                this.authService.deleteUser();
                this.authService.logout();
              });
            } else {
              this.authService.deleteUser();
              this.authService.logout();
              this.accountNotFound = true;
            }
            this.helper.dismissLoading();
          }, error => {
            console.log('got error', error);
            this.authService.deleteUser();
            this.authService.logout();
            this.helper.dismissLoading();
          });
        } else {
          this.canceledSub = true;
          this.authService.deleteUser();
          this.authService.logout();
          this.helper.dismissLoading();
        }
      });
    }).catch(error => {
      console.log(error);
    });
  }

  signUp(): void {
    this.helper.openURL();
  }
}
