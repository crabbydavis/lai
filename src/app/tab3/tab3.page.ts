import { SubscriptionType } from './../core/models/user.model';
import { AuthService } from './../core/services/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  SubscriptionType = SubscriptionType;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
