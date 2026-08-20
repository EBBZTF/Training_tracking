package com.training.tracking.domain;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SessionValueId implements Serializable {

    private Long sessionId;
    private String exerciseId;
    private String side;
    private Integer setIndex;

    public SessionValueId() { }

    public SessionValueId(Long sessionId, String exerciseId, String side, Integer setIndex) {
        this.sessionId = sessionId;
        this.exerciseId = exerciseId;
        this.side = side;
        this.setIndex = setIndex;
    }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public Integer getSetIndex() { return setIndex; }
    public void setSetIndex(Integer setIndex) { this.setIndex = setIndex; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SessionValueId that)) return false;
        return Objects.equals(sessionId, that.sessionId)
                && Objects.equals(exerciseId, that.exerciseId)
                && Objects.equals(side, that.side)
                && Objects.equals(setIndex, that.setIndex);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sessionId, exerciseId, side, setIndex);
    }
}
