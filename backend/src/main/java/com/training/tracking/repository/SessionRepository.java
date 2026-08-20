package com.training.tracking.repository;

import com.training.tracking.domain.Session;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, Long> {
}
