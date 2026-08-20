package com.training.tracking.repository;

import com.training.tracking.domain.WarmupItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarmupItemRepository extends JpaRepository<WarmupItem, Integer> {
    List<WarmupItem> findAllByOrderByPosition();
}
