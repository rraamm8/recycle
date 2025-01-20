package com.project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.domain.FlaskResultDTO;
import com.project.domain.FlaskResultEntity;
import com.project.domain.ShapeEntity;
import com.project.persistence.FlaskResultRepository;

@Service
public class FlaskResultService {
	private final FlaskResultRepository repository;

	public FlaskResultService(FlaskResultRepository repository) {
		this.repository = repository;
	}

	public void saveResult(FlaskResultDTO flaskResult) {
		// DTO의 shapes -> Entity의 shapes 변환
		List<ShapeEntity> shapeEntities = flaskResult.getShapes().stream()
		        .map(shapeDTO -> ShapeEntity.builder()
		            .label(shapeDTO.getLabel())
		            .points(shapeDTO.getPoints()) // JSON 배열 그대로 저장하거나 변환
		            .shapeType(shapeDTO.getShapeType())
		            .groupId(shapeDTO.getGroupId())
		            .flags(shapeDTO.getFlags())
		            .flaskResult(null) // 양방향 관계 처리
		            .build())
		        .collect(Collectors.toList());
		
		// DTO -> Entity 변환
		 FlaskResultEntity entity = FlaskResultEntity.builder()
			        .version(flaskResult.getVersion())
			        .imagePath(flaskResult.getImagePath())
			        .imageHeight(flaskResult.getImageHeight())
			        .imageWidth(flaskResult.getImageWidth())
			        .shapes(shapeEntities)
			        .build();
		 
		 // shapes에 FlaskResultEntity 설정 (양방향 관계 설정)
		 shapeEntities.forEach(shape -> shape.setFlaskResult(entity));
		 
		// 데이터베이스 저장
		repository.save(entity);
	}

}