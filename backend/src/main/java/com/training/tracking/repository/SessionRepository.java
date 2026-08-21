package com.training.tracking.repository;

import com.training.tracking.domain.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findAllByUserId(Long userId);
}
