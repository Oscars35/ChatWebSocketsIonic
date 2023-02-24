import { WebsocketsService } from '../../services/websockets.service';
import { Component } from '@angular/core';
import { Config } from '@ionic/angular';
import * as SockJS from 'sockjs-client';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  leaderBoard: any[] = [];
  userList: any[] = [];
  messages: any[] = []
  message: string;
  user: string | null;
  myName: string | null;

  constructor(private webSocketService: WebsocketsService) {
    
  }

  ngOnInit() {
    this.webSocketService.createSocket("http://localhost:8080/chat");
    this.setListenersForSocket();
  }

  private setListenersForSocket() {
    this.setOnOpen();
    this.setOnMessage();
    this.setOnClose();
  }

  private setOnOpen() {
    this.webSocketService.onOpen.subscribe( (opened) => {
      if (opened === "opened") {
        this.myName = "";
        while (this.myName == "") this.myName = prompt("Enter your name");
        this.sendMessage("join", this.myName);
        setInterval(() => { this.webSocketService.send(JSON.stringify({type: "update", data: this.myName})) }, 3000);
      }
    }); 
  }

  private setOnClose() {
    this.webSocketService.onClose.subscribe((_) => {

    });
  }

  private setOnMessage() {
    this.webSocketService.onMessage.subscribe( (msg) => {
      if(msg.data) {
        this.receievMsg(JSON.parse(msg.data)) 
      }
    });
  }

  sendMessage(type: string, data: any) {
    if (data !== "") {
        this.webSocketService.send(JSON.stringify({type: type, data: data}));
        this.user = data;
        this.message = "";
    }
}

  private receievMsg(msg: any) {
    if (msg.msgType == "say") {
      this.messages.push(msg);
    }
    else if (msg.msgType == "join") {
      this.addUser(msg.data);
    }
    else if (msg.msgType == "users") {
      msg.data.forEach((el: any) => { this.addUser(el); });
    }
    else if (msg.msgType == "left") {
      this.messages.push({user: null, data: msg.data.name + ' left chat'})
      this.userList = this.userList.filter(user => user.name !== msg.data.name);
      this.leaderBoard = this.leaderBoard.filter(user => user.name != msg.data.name)
    }
    else if (msg.msgType == "update") {
      this.updateLeaderboard(msg.data);
    }
  }

  addUser(user: any) {
    this.userList.push(user);
    this.messages.push({user: null, data: user.name + " joined chat"});
  }

  updateLeaderboard(user: any) {
    let userBoard = this.leaderBoard.filter(userSearch => userSearch.name === user.name);
    if (userBoard.length != 0) {
        this.leaderBoard[this.leaderBoard.indexOf(userBoard[0])] = user;
    }
    else {
        this.leaderBoard.push(user);
    }
  }

  leaveChat() {
    if(this.webSocketService.isOpen()) {
      this.webSocketService.send(JSON.stringify({type: "left", data: this.myName}));
      this.messages.push({user: null,data: "You left chat"});
      this.webSocketService.close();
    }
  }

}
