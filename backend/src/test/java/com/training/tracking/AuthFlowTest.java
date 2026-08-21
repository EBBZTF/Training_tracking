package com.training.tracking;

import com.training.tracking.dto.StateDto;
import com.training.tracking.dto.auth.AuthResponse;
import com.training.tracking.dto.auth.LoginRequest;
import com.training.tracking.dto.auth.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Runs against a real embedded server (not MockMvc) so that container-level behavior — like
 * Boot's internal forward to /error when a controller throws ResponseStatusException — is
 * actually exercised through the Spring Security filter chain, the same as in production.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthFlowTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void registerLoginAndAccessOwnState() {
        String email = "user1@example.com";

        ResponseEntity<AuthResponse> registerRes = restTemplate.postForEntity(
                "/api/auth/register", new RegisterRequest(email, "correct-password", "User One"), AuthResponse.class);
        assertEquals(HttpStatus.OK, registerRes.getStatusCode());
        String accessToken = registerRes.getBody().accessToken();
        assertTrue(!accessToken.isBlank());

        // Duplicate registration is rejected with 409, not swallowed into a generic 401.
        ResponseEntity<String> duplicateRes = restTemplate.postForEntity(
                "/api/auth/register", new RegisterRequest(email, "another-password", null), String.class);
        assertEquals(HttpStatus.CONFLICT, duplicateRes.getStatusCode());

        // Wrong password is rejected with a generic message.
        ResponseEntity<String> badLoginRes = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest(email, "wrong-password"), String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, badLoginRes.getStatusCode());

        // Correct login succeeds.
        ResponseEntity<AuthResponse> loginRes = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest(email, "correct-password"), AuthResponse.class);
        assertEquals(HttpStatus.OK, loginRes.getStatusCode());

        // /api/state requires a token.
        ResponseEntity<String> noAuthRes = restTemplate.getForEntity("/api/state", String.class);
        assertEquals(HttpStatus.UNAUTHORIZED, noAuthRes.getStatusCode());

        // With a valid token, a brand-new user sees an empty plan rather than a null one, so the
        // client never has to tell "no account data" apart from "account with nothing in it".
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        ResponseEntity<StateDto> stateRes = restTemplate.exchange(
                "/api/state", HttpMethod.GET, new HttpEntity<>(headers), StateDto.class);
        assertEquals(HttpStatus.OK, stateRes.getStatusCode());
        assertTrue(stateRes.getBody().plan().days().isEmpty());
        assertTrue(stateRes.getBody().plan().warmup().isEmpty());
        assertTrue(stateRes.getBody().logs().isEmpty());
    }
}
