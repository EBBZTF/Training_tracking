package com.training.tracking.repository;

import com.training.tracking.domain.SessionWarmup;
import com.training.tracking.domain.SessionWarmupId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionWarmupRepository extends JpaRepository<SessionWarmup, SessionWarmupId> {
}
