package com.training.tracking.repository;

import com.training.tracking.domain.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionTypeRepository extends JpaRepository<SessionType, Long> {
    List<SessionType> findAllByUserIdIsNullOrUserId(Long userId);

    boolean existsByUserIdAndLabelIgnoreCase(Long userId, String label);
}
