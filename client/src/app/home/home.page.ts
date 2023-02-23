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
  socket: WebSocket;
  user: string | null;
  myName: string | null;

  constructor() {
    this.socket = new SockJS('http://localhost:8080/chat');
    this.socket.onopen = () => {
      this.myName = "";
      while (this.myName == "") this.myName = prompt("Enter your name");
      this.sendMessage("join", this.myName);
      setInterval(() => { this.socket.send(JSON.stringify({type: "update", data: this.myName})); }, 3000);
    }

    this.socket.onmessage = (msg) => { 
      this.receievMsg(JSON.parse(msg.data)) 
    }

    this.socket.onclose = () => { }
  }

  sendMessage(type: string, data: any) {
    if (data !== "") {
        this.socket.send(JSON.stringify({type: type, data: data}));
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
      console.log(this.userList.filter(user => user.name !== msg.data.name));
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
    if(this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({type: "left", data: this.myName}));
      this.messages.push({user: null,data: "You left chat"});
      this.socket.close();
    }
  }

}
