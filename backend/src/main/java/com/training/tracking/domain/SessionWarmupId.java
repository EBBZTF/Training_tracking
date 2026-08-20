package com.training.tracking.domain;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SessionWarmupId implements Serializable {

    private Long sessionId;
    private Integer position;

    public SessionWarmupId() { }

    public SessionWarmupId(Long sessionId, Integer position) {
        this.sessionId = sessionId;
        this.position = position;
    }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SessionWarmupId that)) return false;
        return Objects.equals(sessionId, that.sessionId) && Objects.equals(position, that.position);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sessionId, position);
    }
}
