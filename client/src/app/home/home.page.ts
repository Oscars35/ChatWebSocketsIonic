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

  message: string;
  socket: WebSocket;
  user: string | null;

  constructor() {
    this.socket = new SockJS('http://localhost:8080/chat');
    this.socket.onopen = () => {
      var name: string | null = "";
      while (name == "") name = prompt("Enter your name");
      this.sendMessage("join", name);
      setInterval(() => { this.socket.send(JSON.stringify({type: "update", data: name})); }, 3000);
    }

    this.socket.onmessage = (msg) => { 
      this.receievMsg(JSON.parse(msg.data)) 
    }

    this.socket.onclose = () => { alert("Server Disconnect You"); }
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
      console.log("SAAAY");
      $(".chat-messages").append("<p>"  + this.user + ": "  +msg.data+"</p>");
    }
    else if (msg.msgType == "join") {
      this.addUser(msg.data);
    }
    else if (msg.msgType == "users") {
      msg.data.forEach((el: any) => { this.addUser(el); });
    }
    else if (msg.msgType == "left") {
      $("#user-"+msg.data.id).remove();
    }
    else if (msg.msgType == "update") {
      this.updateLeaderboard(msg.data);
    }
  }

  addUser(user: any) {
    console.log("ADDUSER");
    $("#user-list").append("<li id='user-"+user.id+"'>"+user.name+"</li>");
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

}
