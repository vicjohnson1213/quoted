import { Component } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'q-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  constructor(
    private router: Router,
    private auth: Auth
  ) {
    authState(this.auth)
      .pipe(filter(user => !!user))
      .subscribe(() => this.router.navigate(['/']));
  }

  async logIn() {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }
}
