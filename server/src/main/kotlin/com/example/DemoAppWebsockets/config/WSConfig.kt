package com.example.DemoAppWebsockets.config

import com.example.DemoAppWebsockets.handler.ChatHandler
import org.springframework.context.annotation.Configuration
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@CrossOrigin(origins = ["*"])
@Configuration
@EnableWebSocket
class WSConfig : WebSocketConfigurer {
    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry
            .addHandler(ChatHandler(), "/chat")
            .setAllowedOrigins("http://localhost:8100")
            .withSockJS()
    }
}