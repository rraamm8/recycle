package com.project.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detections") // 데이터베이스 테이블 이름과 매핑
@Getter
@Setter
public class DetectionsEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; // 각 탐지 항목의 고유 ID

	@Column(name = "video_name", nullable = false)
	private String videoName; // 비디오 파일 이름

	@Column(name = "frame_time")
	private float frameTime;

	@Column(name = "class_name")
	private String className;
	
	@Column(name = "detected_at")
	private LocalDateTime detectedAt; // 병이 탐지된 날짜 및 시간

	@Column(name = "bbox_x1")
	private Double bboxX1; // Bounding Box - X1 좌표

	@Column(name = "bbox_y1")
	private Double bboxY1; // Bounding Box - Y1 좌표

	@Column(name = "bbox_x2")
	private Double bboxX2; // Bounding Box - X2 좌표

	@Column(name = "bbox_y2")
	private Double bboxY2; // Bounding Box - Y2 좌표

	@Column(name = "confidence")
	private Double confidence; // 모델 신뢰도(float -> Double)

}
