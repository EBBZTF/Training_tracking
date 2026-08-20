package com.training.tracking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "days")
public class Day {

    @Id
    @Column(length = 16)
    private String id;

    @Column(name = "short_label", nullable = false, length = 32)
    private String shortLabel;

    @Column(length = 32)
    private String slot;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int position;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShortLabel() { return shortLabel; }
    public void setShortLabel(String shortLabel) { this.shortLabel = shortLabel; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}
