import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy{
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(public authService: AuthService){}

  ngOnInit(): void{
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      });
  }

  onSignup(form: NgForm): void{
    if (form.invalid){
      return;
    }
    // const emailInput = form.value.email;
    // const passwordInput = form.value.password;
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);

    // console.log('email:', emailInput);
    // console.log('password:', passwordInput);
  }

  ngOnDestroy(): void{
    this.authStatusSub.unsubscribe();
  }
}
