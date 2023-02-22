package com.example.DemoAppWebsockets

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.CrossOrigin

@SpringBootApplication
@CrossOrigin(origins = ["*"])
class DemoAppWebsocketsApplication

fun main(args: Array<String>) {
	runApplication<DemoAppWebsocketsApplication>(*args)
}
