package com.rustam.modern_dentistry.controller;

import com.rustam.modern_dentistry.dto.request.read.RefreshTokenRequest;
import com.rustam.modern_dentistry.util.UtilService;

import com.rustam.modern_dentistry.dto.request.read.AuthRequest;
import com.rustam.modern_dentistry.dto.response.read.AuthResponse;
import com.rustam.modern_dentistry.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UtilService utilService;

    @PostMapping(path = "/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest){
        return new ResponseEntity<>(authService.login(authRequest), HttpStatus.OK);
    }

    @PostMapping(path = "/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request){
        return new ResponseEntity<>(authService.refresh(request.getRefreshToken()), HttpStatus.OK);
    }

    @PostMapping(path = "/logout")
    public ResponseEntity<Void> logout(){
        authService.logout(utilService.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
