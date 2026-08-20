package com.training.tracking.repository;

import com.training.tracking.domain.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findAllByOrderByPosition();
}
