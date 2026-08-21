package com.training.tracking.domain;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
public class RecurringRuleExceptionId implements Serializable {

    private Long ruleId;
    private LocalDate excludedDate;

    public RecurringRuleExceptionId() { }

    public RecurringRuleExceptionId(Long ruleId, LocalDate excludedDate) {
        this.ruleId = ruleId;
        this.excludedDate = excludedDate;
    }

    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }

    public LocalDate getExcludedDate() { return excludedDate; }
    public void setExcludedDate(LocalDate excludedDate) { this.excludedDate = excludedDate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecurringRuleExceptionId that)) return false;
        return Objects.equals(ruleId, that.ruleId) && Objects.equals(excludedDate, that.excludedDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ruleId, excludedDate);
    }
}
