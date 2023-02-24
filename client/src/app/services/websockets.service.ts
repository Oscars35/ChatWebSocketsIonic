import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {

  socket: WebSocket;
  onOpen: BehaviorSubject<String> = new BehaviorSubject<String>("");
  onClose: BehaviorSubject<String> = new BehaviorSubject<String>("");
  onMessage: BehaviorSubject<MessageEvent> = new BehaviorSubject<MessageEvent>(new MessageEvent("msg"));


  constructor() { 
  }

  createSocket(address: string) {
    this.socket = new SockJS(address);
    this.setListeners();
  }

  setListeners() {
    this.socket.onopen = () => {
      this.onOpen.next("opened");
    }
    this.socket.onmessage = (msg) => {
      this.onMessage.next(msg);
    }
    this.socket.onclose = () => {
      this.onClose.next("closed");
    }
  }

  send(message: any) {
    this.socket.send(message);
  }

  close() {
    this.socket.close();
  }

  isOpen(): Boolean {
    return this.socket.readyState === WebSocket.OPEN
  }
}
