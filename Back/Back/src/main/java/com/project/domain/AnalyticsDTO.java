package com.project.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private String timePeriod;
    private String videoName;
    private String bottleType;
    private boolean recyclable;
    private int totalCount;
    private double totalCarbonReduction;

}
