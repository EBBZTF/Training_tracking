package com.training.tracking.repository;

import com.training.tracking.domain.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findAllByBlock_UserIdOrderByPosition(Long userId);
}
