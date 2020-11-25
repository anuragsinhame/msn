import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  email: string;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    console.log('UserAuthentication', this.userIsAuthenticated);
    console.log(this.email);

    if (this.userIsAuthenticated){
      this.email = this.authService.getEmail();
    }

    this.authListenerSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        if (this.userIsAuthenticated) {
          this.email = this.authService.getEmail();
        } else {
          this.email = null;
        }
      });
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Because the Observable/Subject was created by us, so it needs to be destroyed
  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }
}
