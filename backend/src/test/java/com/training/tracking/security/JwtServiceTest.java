package com.training.tracking.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtService jwtService =
            new JwtService("test-secret-test-secret-test-secret-test-secret", "PT15M", "P30D");

    @Test
    void accessTokenRoundTripsUserIdAndEmail() {
        String token = jwtService.generateAccessToken(42L, "user@example.com");

        var principal = jwtService.parseAccessToken(token).orElseThrow();

        assertEquals(42L, principal.id());
        assertEquals("user@example.com", principal.email());
    }

    @Test
    void garbageTokenDoesNotAuthenticate() {
        assertTrue(jwtService.parseAccessToken("not-a-jwt").isEmpty());
    }

    @Test
    void tokenSignedWithDifferentSecretIsRejected() {
        JwtService other = new JwtService("different-secret-different-secret-different", "PT15M", "P30D");
        String token = other.generateAccessToken(1L, "a@b.com");

        assertTrue(jwtService.parseAccessToken(token).isEmpty());
    }

    @Test
    void opaqueRefreshTokensAreUniqueAndHashDeterministically() {
        String a = jwtService.generateOpaqueRefreshToken();
        String b = jwtService.generateOpaqueRefreshToken();

        assertNotEquals(a, b);
        assertEquals(jwtService.hashToken(a), jwtService.hashToken(a));
        assertNotEquals(jwtService.hashToken(a), jwtService.hashToken(b));
    }
}
