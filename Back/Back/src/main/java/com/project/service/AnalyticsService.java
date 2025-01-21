package com.project.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.domain.AnalyticsDTO;
import com.project.persistence.AnalyticsRepository;

@Service
public class AnalyticsService {
	@Autowired
	private AnalyticsRepository analyticsRepository;

    public List<AnalyticsDTO> getAnalytics(String startDate, String endDate) {
        List<Object[]> results = analyticsRepository.findAnalyticsByDateRange(startDate, endDate);

        // Map query results to DTO
        List<AnalyticsDTO> analyticsList = new ArrayList<>();
        for (Object[] row : results) {
            String timePeriod = (String) row[0];
            String videoName = (String) row[1];
            String bottleType = (String) row[2];
            boolean recyclable = ((Integer) row[3]) == 1;
            int totalCount = ((Number) row[4]).intValue();
            double totalCarbonReduction = ((Number) row[5]).doubleValue();

            analyticsList.add(new AnalyticsDTO(timePeriod, videoName, bottleType, recyclable, totalCount, totalCarbonReduction));
        }

        return analyticsList;
    }
}
