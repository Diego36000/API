import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private pollInterval: any = null;
  private shouldScroll = false;

  conversations: any[] = [];
  selectedConv: any = null;
  messages: any[] = [];
  messageText = '';

  loadingConvs = true;
  loadingMessages = false;
  sending = false;
  convsError = '';
  sendError = '';

  get currentUserId(): number | null { return this.api.getUserId(); }

  ngOnInit(): void {
    if (!this.api.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadConversations(() => {
      const convId = Number(this.route.snapshot.queryParamMap.get('conv'));
      if (convId) {
        const found = this.conversations.find(c => c.id === convId);
        if (found) this.selectConversation(found);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations(cb?: () => void): void {
    this.loadingConvs = true;
    this.api.getConversations().subscribe({
      next: (res: any) => {
        this.conversations = res.data ?? [];
        this.loadingConvs = false;
        cb?.();
      },
      error: () => {
        this.convsError = 'Could not load conversations.';
        this.loadingConvs = false;
      },
    });
  }

  selectConversation(conv: any): void {
    this.selectedConv = conv;
    this.messages = [];
    this.sendError = '';
    this.stopPolling();
    this.loadMessages();
    this.startPolling();
  }

  loadMessages(): void {
    this.loadingMessages = true;
    this.api.getMessages(this.selectedConv.id).subscribe({
      next: (res: any) => {
        this.messages = res.data ?? [];
        this.loadingMessages = false;
        this.shouldScroll = true;
      },
      error: () => { this.loadingMessages = false; },
    });
  }

  pollMessages(): void {
    if (!this.selectedConv) return;
    this.api.getMessages(this.selectedConv.id).subscribe({
      next: (res: any) => {
        const updated = res.data ?? [];
        if (updated.length !== this.messages.length) {
          this.messages = updated;
          this.shouldScroll = true;
        }
      },
      error: () => {},
    });
  }

  startPolling(): void {
    this.pollInterval = setInterval(() => this.pollMessages(), 3000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  sendMessage(): void {
    const content = this.messageText.trim();
    if (!content || !this.selectedConv || this.sending) return;
    this.sending = true;
    this.sendError = '';
    this.api.sendMessage(this.selectedConv.id, content).subscribe({
      next: (res: any) => {
        this.messageText = '';
        this.messages = [...this.messages, res.data];
        this.shouldScroll = true;
        this.sending = false;
        this.loadConversations();
      },
      error: (err: any) => {
        this.sendError = err?.error?.error || 'Error sending message.';
        this.sending = false;
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  getOtherUser(conv: any): { name: string; photo: string } {
    if (conv.buyer_id === this.currentUserId) {
      return { name: conv.seller_name, photo: conv.seller_photo };
    }
    return { name: conv.buyer_name, photo: conv.buyer_photo };
  }

  openItem(itemId: number): void {
    this.router.navigate(['/items', itemId]);
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}
