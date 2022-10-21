import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { child, Database, objectVal, push, ref, remove, update } from '@angular/fire/database';
import { filter, from, map, Observable, of, switchMap } from 'rxjs';
import { Quote } from '../model/quote.dto';
import { IQuoteService } from './interfaces/IQuoteService.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteService implements IQuoteService {
  constructor(
    private auth: Auth,
    private db: Database
  ) { }

  quotes$: Observable<{ [key: string]: Quote; }> =
    authState(this.auth).pipe(
      filter(user => !!user),
      switchMap(user => objectVal<{ [key: string]: Quote; }>(ref(this.db, `/user-quotes/${user?.uid}`))),
      map(quotes => quotes || [])
    );

  saveQuote(quote: Quote): Observable<any> {
    if (!quote.id) {
      quote.id = push(child(ref(this.db), 'user-quotes')).key!;
    }

    const updates: { [key: string]: Quote } = {};
    updates['/user-quotes/' + this.auth.currentUser?.uid + '/' + quote.id] = quote;

    return from(update(ref(this.db), updates));
  }

  deleteQuote(quote: Quote): Observable<any> {
    return from(remove(ref(this.db, `user-quotes/${this.auth.currentUser?.uid}/${quote.id}`)))
  }
}
