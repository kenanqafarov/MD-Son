package com.rustam.modern_dentistry.service;

import com.rustam.modern_dentistry.dao.entity.users.BaseUser;
import com.rustam.modern_dentistry.dao.repository.BaseUserRepository;
import com.rustam.modern_dentistry.dto.request.read.AuthRequest;
import com.rustam.modern_dentistry.dto.request.update.ChangePasswordRequest;
import com.rustam.modern_dentistry.dto.response.TokenPair;
import com.rustam.modern_dentistry.dto.response.read.AuthResponse;
import com.rustam.modern_dentistry.exception.custom.IncorrectPasswordException;
import com.rustam.modern_dentistry.util.UtilService;
import com.rustam.modern_dentistry.util.user.UserDetailsServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {

    UtilService utilService;
    BaseUserRepository baseUserRepository;
    PasswordEncoder passwordEncoder;
    UserDetailsServiceImpl userDetailsService;
    RedisTemplate<String, String> redisTemplate;

    public AuthResponse login(AuthRequest authRequest) {
        BaseUser baseUser;
        try {
            baseUser = utilService.findByUsername(authRequest.getUsername());
        } catch (UsernameNotFoundException ex) {
            // OWASP best practice: prevent user enumeration by giving identical generic error
            throw new IncorrectPasswordException("İstifadəçi adı və ya şifrə yanlışdır.");
        }

        if (!passwordEncoder.matches(authRequest.getPassword(), baseUser.getPassword())) {
            throw new IncorrectPasswordException("İstifadəçi adı və ya şifrə yanlışdır.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(baseUser.getId());
        TokenPair tokenPair = utilService.tokenProvider(baseUser.getId(), userDetails);
        try {
            String redisKey = "refresh_token:" + baseUser.getId();
            redisTemplate.opsForValue().set(redisKey, tokenPair.getRefreshToken(), Duration.ofDays(2)); // 2 gün müddətinə saxla
        } catch (Exception e) {
            log.error("Failed to store refresh token in Redis for user {}: {}", baseUser.getId(), e.getMessage());
        }
        return AuthResponse.builder()
                .tokenPair(tokenPair)
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String currentUserId = utilService.getCurrentUserId();
        if (currentUserId == null || currentUserId.isBlank()) {
            throw new IncorrectPasswordException("İcazəsiz müraciət. Zəhmət olmasa yenidən daxil olun.");
        }

        BaseUser baseUser = utilService.findByBaseUserId(currentUserId);

        if (!passwordEncoder.matches(request.getOldPassword(), baseUser.getPassword())) {
            throw new IncorrectPasswordException("Köhnə şifrə yanlışdır.");
        }

        baseUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        baseUserRepository.save(baseUser);
        log.info("Password successfully changed for user {}", baseUser.getUsername());
    }
}
