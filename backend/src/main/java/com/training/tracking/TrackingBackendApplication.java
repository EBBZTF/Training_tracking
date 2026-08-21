package com.training.tracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Excludes UserDetailsServiceAutoConfiguration: auth is handled entirely by our own JWT filter
 * (see security package), so there's no legitimate use for Boot's default in-memory user —
 * leaving it enabled just adds a confusing "generated security password" log line and can make
 * test HTTP clients attempt Basic-auth retries against our endpoints.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class TrackingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrackingBackendApplication.class, args);
    }
}
