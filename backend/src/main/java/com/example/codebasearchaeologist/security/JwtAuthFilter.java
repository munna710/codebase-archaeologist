package com.example.codebasearchaeologist.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                      @NonNull HttpServletResponse response,
                                      @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // no token — let it through as anonymous;
            return;                                   // SecurityConfig decides if the endpoint needs auth
        }

        String token = authHeader.substring(7); // strip "Bearer " prefix

        if (jwtService.isTokenValid(token)) {
            String email = jwtService.extractEmail(token);
            Long userId = jwtService.extractUserId(token);

            AuthenticatedUser principal = new AuthenticatedUser(userId, email);

            var authentication = new UsernamePasswordAuthenticationToken(
                    principal, null, Collections.emptyList());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}