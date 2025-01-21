package com.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.domain.AnalyticsDTO;
import com.project.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
	@Autowired
	private AnalyticsService analyticsService;
	
	@GetMapping
	public ResponseEntity<List<AnalyticsDTO>> getAnalytics(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        List<AnalyticsDTO> analytics = analyticsService.getAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
}
