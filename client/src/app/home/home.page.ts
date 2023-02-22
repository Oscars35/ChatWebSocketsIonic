import { Component } from '@angular/core';
import { Config } from '@ionic/angular';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  message: string;
  socket: WebSocket;
  user: string;

  constructor() {
    this.socket = new SockJS('http://localhost:8080/chat');
    this.socket.onopen = () => {
      var name: string | null = "";
      while (name == "") name = prompt("Enter your name");
      this.sendMessage("join", name);
    }
  }

  private sendMessage(type: string, data: any) {
    if (data !== "") {
        this.socket.send(JSON.stringify({type: type, data: data}));
        this.user = data;
        this.message = "";
    }
}

}
