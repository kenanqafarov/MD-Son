package com.rustam.modern_dentistry.dto.request.read;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefreshTokenRequest {
    @NotBlank(message = "refreshToken boş ola bilməz")
    private String refreshToken;
}
