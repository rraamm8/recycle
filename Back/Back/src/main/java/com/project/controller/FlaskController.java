package com.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.domain.FlaskResultDTO;
import com.project.service.FlaskClientService;
import com.project.service.FlaskResultService;

@RestController
@RequestMapping("/api/flask")
public class FlaskController {
	
	private final FlaskClientService flaskClientService;
	private final FlaskResultService flaskResultService;
	
	public FlaskController(FlaskClientService flaskClientService, FlaskResultService flaskResultService) {
		this.flaskClientService = flaskClientService;
		this.flaskResultService = flaskResultService;
	}
	
	@GetMapping("/fetch/{id}")
	public ResponseEntity<String> fetchAndStoreFlaskResult(@PathVariable String id) {
		// Flask에서 데이터 가져오기
		FlaskResultDTO flaskResultDTO = flaskClientService.fetchFlaskResult(id);
		
		// 데이터 저장
		flaskResultService.processAndSaveFlaskResult(flaskResultDTO);
		
		return ResponseEntity.ok("Data fetched and stored successfully");
	}

}
