package com.training.tracking.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        String email,
        String displayName
) {
}
