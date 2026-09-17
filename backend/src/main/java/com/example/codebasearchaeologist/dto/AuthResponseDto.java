package com.example.codebasearchaeologist.dto;

public class AuthResponseDto {
    private String token;
    private Long userId;
    private String name;
    private String email;

    public AuthResponseDto(String token, Long userId, String name, String email) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}