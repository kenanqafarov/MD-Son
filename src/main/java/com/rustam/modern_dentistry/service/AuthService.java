package com.rustam.modern_dentistry.service;

import com.rustam.modern_dentistry.dao.entity.users.BaseUser;
import com.rustam.modern_dentistry.dto.request.read.AuthRequest;
import com.rustam.modern_dentistry.dto.response.TokenPair;
import com.rustam.modern_dentistry.dto.response.read.AuthResponse;
import com.rustam.modern_dentistry.exception.custom.IncorrectPasswordException;
import com.rustam.modern_dentistry.util.UtilService;
import com.rustam.modern_dentistry.util.user.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rustam.modern_dentistry.exception.custom.InvalidTokenException;
import com.rustam.modern_dentistry.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthService {

    UtilService utilService;
    PasswordEncoder passwordEncoder;
    UserDetailsServiceImpl userDetailsService;
    RedisTemplate<String,String> redisTemplate;
    JwtUtil jwtUtil;

    @NonFinal
    @Value("${spring.application.jwt.expiration}")
    long jwtExpiration;

    @NonFinal
    @Value("${spring.application.jwt.refresh-token.expiration}")
    long refreshExpiration;
    private static final String REFRESH_KEY = "refresh_token:";
    private static final String REVOKED_KEY = "revoked_before:";

    public AuthResponse login(AuthRequest authRequest) {
        BaseUser baseUser = utilService.findByUsername(authRequest.getUsername());
        if (!passwordEncoder.matches(authRequest.getPassword(), baseUser.getPassword())) {
            throw new IncorrectPasswordException("password does not match");
        }
        return issueTokens(baseUser.getId());
    }

    public AuthResponse refresh(String refreshToken) {
        String userId;
        try {
            if (!jwtUtil.isRefreshToken(refreshToken)) {
                throw new InvalidTokenException("Refresh token deyil");
            }
            userId = jwtUtil.extractUsername(refreshToken);
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidTokenException("Refresh token etibarsızdır");
        }
        // Yalnız Redis-də saxlanılan son refresh token qəbul olunur (çıxışdan sonra silinir)
        String stored = redisTemplate.opsForValue().get(REFRESH_KEY + userId);
        if (!refreshToken.equals(stored)) {
            throw new InvalidTokenException("Refresh token etibarsızdır");
        }
        return issueTokens(userId);
    }

    public void logout(String userId) {
        redisTemplate.delete(REFRESH_KEY + userId);
        // Bu andan əvvəl verilmiş access tokenlər qəbul olunmur (ən çox access token ömrü qədər saxlanılır)
        redisTemplate.opsForValue().set(REVOKED_KEY + userId,
                String.valueOf(System.currentTimeMillis() / 1000), Duration.ofMillis(jwtExpiration));
    }

    public boolean isRevoked(String userId, Date issuedAt) {
        try {
            String cutoff = redisTemplate.opsForValue().get(REVOKED_KEY + userId);
            return cutoff != null && issuedAt != null && issuedAt.getTime() / 1000 < Long.parseLong(cutoff);
        } catch (Exception e) {
            log.error("Failed to read token revocation for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    private AuthResponse issueTokens(String userId) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
        TokenPair tokenPair = utilService.tokenProvider(userId, userDetails);
        try {
            redisTemplate.opsForValue().set(REFRESH_KEY + userId, tokenPair.getRefreshToken(),
                    Duration.ofMillis(refreshExpiration));
        } catch (Exception e) {
            log.error("Failed to store refresh token in Redis for user {}: {}", userId, e.getMessage());
        }
        return AuthResponse.builder()
                .tokenPair(tokenPair)
                .build();
    }
}
