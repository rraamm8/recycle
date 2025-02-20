package com.project.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultDTO {
	private String dayOfWeek;
    private String timePeriod;
    private String videoName;
    private String bottleType;
    private Boolean recyclable;
    private Long totalCount;
    private Double totalCarbonReduction;

}
