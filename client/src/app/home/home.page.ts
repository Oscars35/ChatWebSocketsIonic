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
      setInterval(() => { this.socket.send(JSON.stringify({type: "update", data: name})); }, 3000);
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
      $("#user-"+msg.data.id).remove();
      this.messages.push({user: msg.data, data: ' left chat'})
      $("#user-"+msg.data.id+"leaderboard").remove();
    }
    else if (msg.msgType == "update") {
      this.updateLeaderboard(msg.data);
    }
  }

  addUser(user: any) {
    $("#user-list").append("<li id='user-"+user.id+"'>"+user.name+"</li>");
    this.messages.push({user: null, data: user.name + " joined chat"});
  }

  updateLeaderboard(user: any) {
    console.log("updateLeader");
    if (document.getElementById("user-"+user.id+"leaderboard")) {
        //let previousScore = document.getElementById("user-"+user.name+"leaderboard").innerHTML.split(" ")[1];
        //console.log(previousScore);
        document.getElementById("user-"+user.id+"leaderboard")!!.innerHTML = "" + user.name + ": " + user.score
    }
    else {
        $("#leaderboard-list").append("<li id='user-"+user.id+"leaderboard'>"+user.name+": "+user.score+"</li>");
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
