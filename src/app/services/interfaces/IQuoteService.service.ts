import { Observable } from "rxjs";
import { Quote } from "src/app/model/quote.dto";

export interface IQuoteService {
    quotes$: Observable<{ [key: string]: Quote }>;
    saveQuote(quote: Quote): Observable<any>;
    deleteQuote(quote: Quote): Observable<any>;
}