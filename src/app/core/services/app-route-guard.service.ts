import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RouteGuardService implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('in route guard');
    return this.auth.isAuthenticated().pipe(map(user  => {
      if (user === null || user === undefined) {
        this.router.navigate(['/login'], {
          queryParams: {
            return: state.url
          }
        });
        return false;
      } else {
        this.auth.getUser(user).subscribe(doc => {
          const dbUser = doc.data();
          this.auth.setUser(dbUser);
        }, error => console.error(JSON.stringify(error)));
        return true;
      }
    }));
  }
}
