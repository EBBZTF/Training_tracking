package com.training.tracking.repository;

import com.training.tracking.domain.SessionWarmup;
import com.training.tracking.domain.SessionWarmupId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionWarmupRepository extends JpaRepository<SessionWarmup, SessionWarmupId> {
    List<SessionWarmup> findAllBySession_UserId(Long userId);
}
