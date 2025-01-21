package com.project.domain;


import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
	
	@ManyToOne
	@JoinColumn(name = "class_id", referencedColumnName = "id")
	private ClassesEntity className; // 병 종류와 연관 (Classes 테이블과 연관)
	
	@Column(name = "video_name", nullable = false)
	private String videoName; // 비디오 파일 이름
	
	@Column(name = "frame_number", nullable = false)
	private Integer frameNumber; // 프레임 번호
	
	@Column(name = "confidence", nullable = false)
	private Double confidence; // 모델 신뢰도(float -> Double)
	
	@Column(name = "bbox_x")
	private Double bboxX; // Bounding Box - X 좌표
	
	@Column(name = "bbox_y")
	private Double bboxY; // Bounding Box - Y 좌표
	
	@Column(name = "bbox_width")
	private Double bboxWidth; // Bounding Box - 너비
	
	@Column(name = "bbox_height")
	private Double bboxHeigth; // Bounding Box - 높이
	
	@Column(name = "detected_day", length = 10)
	private String detectedDay;  // 병이 탐지된 요일 (예: Monday)

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;  // 병이 탐지된 날짜 및 시간

}
