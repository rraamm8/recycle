package com.project.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.project.domain.FlaskResultDTO;

@Service
public class FlaskClientService {
	
	private final RestTemplate restTemplate;
	
	public FlaskClientService(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}
	
	public FlaskResultDTO fetchFlaskResult(String resultId) {
		String flaskApiUrl = "http://10.125.121.224:5000/api/results" + resultId;
		
		// Flask API 호출
		ResponseEntity<FlaskResultDTO> response = restTemplate.getForEntity(flaskApiUrl, FlaskResultDTO.class);
		
		if (response.getStatusCode().is2xxSuccessful()) {
			return response.getBody();
		} else {
			throw new RuntimeException("Failed to fetch data from Flask API");
		}
	}

}
