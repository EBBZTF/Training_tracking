package com.training.tracking.repository;

import com.training.tracking.domain.Day;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayRepository extends JpaRepository<Day, String> {
    List<Day> findAllByOrderByPosition();
}
