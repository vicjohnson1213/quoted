import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { Quote } from 'src/app/model/quote.dto';
import { QuoteService } from 'src/app/services/quote.service';

@Component({
  selector: 'q-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public quotes: Quote[] = [];
  public newQuoteForm!: FormGroup;
  public showEditQuoteModal = false;

  @ViewChildren('content') contentField?: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private quoteSvc: QuoteService) { }

  ngOnInit(): void {
    this.newQuoteForm = this.fb.group({
      content: ['', [Validators.required]],
      author: ['']
    });

    this.quoteSvc.getQuotes()
      .subscribe(quotes => this.quotes = quotes);
  }

  ngAfterViewInit(): void {
    this.contentField?.changes.subscribe(() => {
      console.log('focus')
      if (this.contentField?.length) {
        this.contentField.first.nativeElement.focus();
      }
    });
  }

  editQuote(quote?: Quote) {
    this.newQuoteForm.patchValue({
      content: quote?.content,
      author: quote?.author
    });

    this.showEditQuoteModal = true;
  }

  cancelEditing() {
    this.showEditQuoteModal = false;
    this.newQuoteForm.reset();
  }

  deleteQuote() {
    console.log('delete quote')
  }

  saveQuote() {
    if (!this.newQuoteForm.valid) {
      return;
    }

    this.quoteSvc.saveQuote({
      content: this.newQuoteForm.value.content,
      author: this.newQuoteForm.value.author
    }).subscribe(() => {
      this.showEditQuoteModal = false;
    });
  }
}
