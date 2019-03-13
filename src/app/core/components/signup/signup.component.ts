import { HelperService } from '../../services/helper.service';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/models/user.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  accountNotFound = false;
  confirmPassword = '';
  email = '';
  password = '';

  private createdUser = false;

  constructor(
    private authService: AuthService,
    private helper: HelperService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.authService.login('t@t.com', 'nothanks').then(res => {

    }).catch(error => {
      console.log('hit error');
      console.log(error);
    });
  }

  closeModal(): void {
    if (!this.createdUser) {
      console.log('logging out t@t');
      this.authService.logout();
    }
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
    // check if in cancels list first?
    this.authService.getUserFromDB(this.email).subscribe(res => {
      console.log('found user', res);
      const user: User = res[0];
      if (res.length > 0) {
        this.authService.createUser(user, this.password).then(() => {
          this.createdUser = true;
          this.authService.user = user;
          this.modalCtrl.dismiss();
          // this.router.navigate(['/']);
        }, error => {
          alert(error);
        });
      } else {
        this.accountNotFound = true;
      }
      this.helper.dismissLoading();
    }, error => {
      console.log('got error', error);
      this.helper.dismissLoading();
    });
  }

  signUp(): void {
    this.helper.openURL();
  }
}
