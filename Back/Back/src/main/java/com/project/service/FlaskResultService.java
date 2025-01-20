package com.project.service;

import org.springframework.stereotype.Service;

import com.project.domain.FlaskResultDTO;
import com.project.domain.FlaskResultEntity;
import com.project.persistence.FlaskResultRepository;

@Service
public class FlaskResultService {
	private final FlaskResultRepository repository;

	public FlaskResultService(FlaskResultRepository repository) {
		this.repository = repository;
	}

	public void saveResult(FlaskResultDTO flaskResult) {
		// DTO -> Entity 변환
		FlaskResultEntity entity = new FlaskResultEntity(
			flaskResult.getVersion(), 
			flaskResult.getImagePath(),
		    flaskResult.getImageHeight(), 
		    flaskResult.getImageWidth()
		);
		
		// 데이터베이스 저장
		repository.save(entity);
	}

}