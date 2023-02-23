package com.example.DemoAppWebsockets.handler

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.atomic.AtomicLong

class User(val id: Long, val name: String, var score: Int) {
    fun updateScore(): User {
        this.score += 1;
        return this;
    }
}
class Message(val msgType: String, val data: Any)
class ChatMessage(val msgType: String, val data: Any, val user: User);

class ChatHandler : TextWebSocketHandler() {

    val sessionList = HashMap<WebSocketSession, User>()
    var uids = AtomicLong(0)

    @Throws(Exception::class)
    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        sessionList -= session
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val json = ObjectMapper().readTree(message.payload)
        // {type: "join/say", data: "name/msg"}
        when (json.get("type").asText()) {
            "join" -> {
                val user = User(uids.getAndIncrement(), json.get("data").asText(), 0)
                sessionList.put(session, user)
                // tell this user about all other users
                emit(session, Message("users", sessionList.values))
                // tell all other users, about this user
                broadcastToOthers(session, Message("join", user))
            }
            "say" -> {
                val user = this.sessionList[session]
                broadcast(ChatMessage("say", json.get("data").asText(), user!!))
            }
            "update" -> {
                val user = this.sessionList[session]?.updateScore()

                //Tell the others about my score
                broadcastToOthers(session, Message("update", user!!))
                //Tell me about the others score
                emit(session, Message("update", user));
            }

          "left" -> {
            val user = this.sessionList[session];
            //Tell the others about my leaving
            broadcastToOthers(session, Message("left", user!!))
          }
        }
    }

    fun emit(session: WebSocketSession, msg: Message) = session.sendMessage(TextMessage(jacksonObjectMapper().writeValueAsString(msg)))
    fun emit(session: WebSocketSession, msg: ChatMessage) = session.sendMessage(TextMessage(jacksonObjectMapper().writeValueAsString(msg)))
    fun broadcast(msg: Message) = sessionList.forEach { emit(it.key, msg) }
    fun broadcast(msg: ChatMessage) = sessionList.forEach { emit(it.key, msg) }
    fun broadcastToOthers(me: WebSocketSession, msg: Message) = sessionList.filterNot { it.key == me }.forEach { emit(it.key, msg) }
}
