package com.training.tracking.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "session_warmup")
public class SessionWarmup {

    @EmbeddedId
    private SessionWarmupId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("sessionId")
    @JoinColumn(name = "session_id")
    private Session session;

    public SessionWarmupId getId() { return id; }
    public void setId(SessionWarmupId id) { this.id = id; }

    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }
}
