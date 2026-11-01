package com.rustam.modern_dentistry.dto.request.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {

    @NotBlank(message = "Köhnə şifrə tələb olunur")
    String oldPassword;

    @NotBlank(message = "Yeni şifrə tələb olunur")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$",
            message = "Yeni şifrə minimum 8 simvol olmalı, böyük/kiçik hərf, rəqəm və xüsusi simvol içərməlidir."
    )
    String newPassword;
}
