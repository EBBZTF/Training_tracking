package com.training.tracking.repository;

import com.training.tracking.domain.SessionWarmup;
import com.training.tracking.domain.SessionWarmupId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SessionWarmupRepository extends JpaRepository<SessionWarmup, SessionWarmupId> {
    List<SessionWarmup> findAllBySession_UserId(Long userId);

    /**
     * Cleared explicitly before the sessions themselves rather than left to the schema's
     * ON DELETE CASCADE, so the wipe does not depend on how the tables were created.
     */
    @Modifying
    @Query("DELETE FROM SessionWarmup sw WHERE sw.session.id IN "
            + "(SELECT s.id FROM Session s WHERE s.userId = :userId)")
    void deleteAllByUserId(@Param("userId") Long userId);
}
