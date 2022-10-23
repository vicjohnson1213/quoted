import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Quote } from 'src/app/model/quote.dto';
import { QuoteService } from 'src/app/services/quote.service';

@Component({
  selector: 'q-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public quoteForm!: FormGroup;
  public searchForm!: FormGroup;
  public showEditQuoteModal = false;

  private quotes: Quote[] = [];
  public filteredQuotes: Quote[] = [];

  private selectedQuote?: Quote;

  @ViewChildren('content') contentField?: QueryList<ElementRef>;
  @ViewChild('search') searchField?: ElementRef;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private quoteSvc: QuoteService) { }


  ngOnInit(): void {
    this.quoteForm = this.fb.group({
      content: ['', [Validators.required]],
      author: ['']
    });

    this.searchForm = this.fb.group({
      search: ['']
    });

    this.searchForm.valueChanges
      .subscribe(() => this.updateQuotes());

    this.quoteSvc.quotes$
      .subscribe(quotes => {
        this.quotes = Object.values(quotes);
        this.quotes.sort((a, b) => (a.author || 'zzz')?.localeCompare((b.author || 'zzz')));
        this.updateQuotes();
      });
  }

  ngAfterViewInit(): void {
    this.contentField?.changes.subscribe(() => {
      if (this.contentField?.length) {
        this.contentField.first.nativeElement.focus();
      }
    });
  }

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.cancelEditing();
    }
  }

  updateQuotes() {
    this.filteredQuotes = this.quotes.filter(quote => {
      const search = this.searchForm.value.search.toLowerCase();
      return (
        !search ||
        quote.author?.toLowerCase().includes(search.toLowerCase()) ||
        (!quote.author && 'unknown'.includes(search.toLowerCase())) ||
        quote.content.toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  editQuote(quote?: Quote) {
    this.selectedQuote = quote;
    this.quoteForm.patchValue({
      content: quote?.content,
      author: quote?.author
    });

    this.showEditQuoteModal = true;
  }

  cancelEditing() {
    this.showEditQuoteModal = false;
    this.quoteForm.reset();
  }

  deleteQuote() {
    if (!this.selectedQuote) {
      return;
    }

    this.quoteSvc.deleteQuote(this.selectedQuote)
      .subscribe(() => {
        this.showEditQuoteModal = false;
        this.updateQuotes();
      });
  }

  saveQuote() {
    if (!this.quoteForm.valid) {
      return;
    }

    const newQuote: Quote = {
      content: this.quoteForm.value.content,
      id: this.selectedQuote?.id
    };

    if (this.quoteForm.value.author) {
      newQuote.author = this.quoteForm.value.author
    };

    this.quoteSvc.saveQuote(newQuote)
      .subscribe(() => {
        this.showEditQuoteModal = false;
        this.updateQuotes();
      });
  }
}
