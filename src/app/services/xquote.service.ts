import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Quote } from '../model/quote.dto';
import { IQuoteService } from './interfaces/IQuoteService.service';


interface GistFile {
  filename: string;
  raw_url: string;
  content: string;
}

interface Gist {
  description: string;
  id: string;
  files: { [key: string]: GistFile };
}

interface QuotesFile {
  settings: any;
  quotes: { [key: string]: Quote };
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService implements IQuoteService {
  private _gist?: Gist;
  private _whatever$ = new BehaviorSubject<{ [key: string]: Quote }>({});

  constructor(private http: HttpClient) { }

  get quotes$(): Observable<{ [key: string]: Quote }> {
    if (Object.keys(this._whatever$.value).length) {
      return this._whatever$.asObservable();
    }

    return this.http.get<Gist[]>('https://api.github.com/gists', {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`
      }
    }).pipe(
      map(gists => gists.find(gist => gist.description === 'Quoted')),
      switchMap(gist => {
        return !!gist ? of(gist) : this.http.post<Gist>('https://api.github.com/gists', {
          description: 'Quoted',
          public: false,
          files: {
            'quoted.json': { content: JSON.stringify({ quotes: {} }) }
          }
        }, {
          headers: { Authorization: `Bearer ${GH_TOKEN}` }
        });
      }),
      // filter(gist => !!gist),
      tap(gist => this._gist = gist),
      switchMap(gist => this.http.get<QuotesFile>(gist!.files['quoted.json'].raw_url)),
      tap(quotesFile => this._whatever$.next(quotesFile.quotes)),
      switchMap(() => this._whatever$.asObservable())
    );
  }

  saveQuote(quote: Quote): Observable<any> {
    // If this quote already has an id, we're just editing one. If it's missing
    // it's id, generate a new one.
    if (!quote.id) {
      do {
        quote.id = uuid();
      } while (this._whatever$.value[quote.id]);
    }

    this._whatever$.value[quote.id] = quote;
    return this.saveAll();
  }

  deleteQuote(quote: Quote): Observable<any> {
    delete this._whatever$.value[quote.id!];
    return this.saveAll();
  }

  private saveAll(): Observable<any> {
    if (!this._gist) {
      throw new Error("what's the gist??");
    }

    return this.http.patch<Gist>(`https://api.github.com/gists/${this._gist.id}`, {
      files: {
        'quoted.json': {
          content: JSON.stringify({
            quotes: this._whatever$.value
          })
        }
      }
    }, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`
      },
    }).pipe(
      map(gist => JSON.parse(gist.files['quoted.json'].content)),
      tap(quotesFile => this._whatever$.next(quotesFile.quotes))
    );
  }
}
