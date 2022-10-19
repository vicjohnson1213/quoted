import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Quote } from '../model/quote.dto';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private _quotes: Quote[] = [
    {
      "content": "Some very interesting quote that's been edited\n\nWith another line here",
      "author": "Charles Bukowski"
    },
    {
      "content": "A different quote",
      "author": "Someone else"
    }
  ];

  constructor() { }

  getQuotes(): Observable<Quote[]> {
    return of(this._quotes)
  }

  saveQuote(quote: Quote): Observable<any> {
    this._quotes.push(quote);
    return of({});
  }
}
