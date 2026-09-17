package com.example.codebasearchaeologist.controller;

import com.example.codebasearchaeologist.dto.AuthResponseDto;
import com.example.codebasearchaeologist.dto.LoginRequestDto;
import com.example.codebasearchaeologist.dto.RegisterRequestDto;
import com.example.codebasearchaeologist.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto request) {
        return authService.login(request);
    }
}