import { Component, OnInit, Optional } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { EMPTY, map, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'q-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public readonly user: Observable<User | null> = EMPTY;

  constructor(
    private router: Router,
    @Optional() private auth: Auth
  ) {
    if (auth) {
      console.log('auth here');
      authState(this.auth)
        .subscribe(user => {
          if (user) {
            this.router.navigate(['/']);
          }
        });
    }
  }

  ngOnInit(): void {
  }

  async logIn() {
    await signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async logOut() {
    return await signOut(this.auth);
  }
}
