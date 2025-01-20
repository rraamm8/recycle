package com.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.domain.FlaskResultDTO;
import com.project.service.FlaskResultService;

@RestController
@RequestMapping("/api/flask")
public class FlaskController {
	
	private final FlaskResultService flaskResultService;
	
	public FlaskController(FlaskResultService flaskResultService) {
		this.flaskResultService = flaskResultService;
	}
	
	@PostMapping("/results")
	public ResponseEntity<String> receiveFlaskResults(@RequestBody FlaskResultDTO flaskData) {
		flaskResultService.saveResult(flaskData);
		return ResponseEntity.ok("Results saved successfully");
	}

}
