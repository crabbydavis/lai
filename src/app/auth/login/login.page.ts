import { AuthService } from './../../core/services/auth.service';
import { HelperService } from './../../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private helper: HelperService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  login() {
    this.helper.presentLoading();
    this.auth.login(this.email, this.password).then(res => {
      // console.log(res);
      console.log('going to set auth user');
      // this.auth.setUser(res);
      console.log('set auth user');
      // console.log(res.token);
      // if (res.token) {
        console.log('TRYING TO NAVIGATE');
        this.router.navigate(['/']);
      // }
      this.helper.dismissLoading();
    }).catch(error => {
      console.log(error);
      this.helper.dismissLoading();
      this.helper.presentToast();
    });
  }
}
