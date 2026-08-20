package com.training.tracking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "warmup_items")
public class WarmupItem {

    @Id
    private Integer position;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
