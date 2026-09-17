package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.dto.AuthResponseDto;
import com.example.codebasearchaeologist.dto.LoginRequestDto;
import com.example.codebasearchaeologist.dto.RegisterRequestDto;
import com.example.codebasearchaeologist.entity.User;
import com.example.codebasearchaeologist.exception.DuplicateUserException;
import com.example.codebasearchaeologist.exception.InvalidCredentialsException;
import com.example.codebasearchaeologist.repository.UserRepository;
import com.example.codebasearchaeologist.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateUserException(request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved.getEmail(), saved.getUserId());
        return new AuthResponseDto(token, saved.getUserId(), saved.getName(), saved.getEmail());
    }

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user.getEmail(), user.getUserId());
        return new AuthResponseDto(token, user.getUserId(), user.getName(), user.getEmail());
    }
}