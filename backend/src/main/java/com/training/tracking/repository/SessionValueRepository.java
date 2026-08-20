package com.training.tracking.repository;

import com.training.tracking.domain.SessionValue;
import com.training.tracking.domain.SessionValueId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionValueRepository extends JpaRepository<SessionValue, SessionValueId> {
}
