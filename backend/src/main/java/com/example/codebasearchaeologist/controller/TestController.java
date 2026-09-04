package com.example.codebasearchaeologist.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/hello")
    public String sayHello() {
        return "Codebase Archaeologist backend is running!";
    }

}