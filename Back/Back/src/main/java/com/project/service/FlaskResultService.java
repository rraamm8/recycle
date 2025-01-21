package com.project.service;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.domain.FlaskResultDTO;
import com.project.domain.FlaskResultEntity;
import com.project.domain.ShapeEntity;
import com.project.persistence.FlaskResultRepository;

@Service
public class FlaskResultService {
    private final FlaskResultRepository flaskResultRepository;

    public FlaskResultService(FlaskResultRepository flaskResultRepository) {
        this.flaskResultRepository = flaskResultRepository;
    }

    public void processAndSaveFlaskResult(FlaskResultDTO flaskResultDTO) {
        // DTO -> Entity 변환
        FlaskResultEntity entity = FlaskResultEntity.builder()
            .version(flaskResultDTO.getVersion())
            .imagePath(flaskResultDTO.getImagePath())
            .imageHeight(flaskResultDTO.getImageHeight())
            .imageWidth(flaskResultDTO.getImageWidth())
            .shapes(flaskResultDTO.getShapes().stream()
                .map(shapeDTO -> ShapeEntity.builder()
                    .label(shapeDTO.getLabel())
                    .points(shapeDTO.getPoints())
                    .shapeType(shapeDTO.getShapeType())
                    .groupId(shapeDTO.getGroupId())
                    .flags(shapeDTO.getFlags())
                    .build())
                .collect(Collectors.toList())) // Collect to List
            .build();

        // 데이터 저장
        flaskResultRepository.save(entity);
    }
}
