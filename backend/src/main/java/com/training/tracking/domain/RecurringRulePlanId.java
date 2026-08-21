package com.training.tracking.domain;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RecurringRulePlanId implements Serializable {

    private Long ruleId;
    private Short position;

    public RecurringRulePlanId() { }

    public RecurringRulePlanId(Long ruleId, Short position) {
        this.ruleId = ruleId;
        this.position = position;
    }

    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }

    public Short getPosition() { return position; }
    public void setPosition(Short position) { this.position = position; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecurringRulePlanId that)) return false;
        return Objects.equals(ruleId, that.ruleId) && Objects.equals(position, that.position);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ruleId, position);
    }
}
