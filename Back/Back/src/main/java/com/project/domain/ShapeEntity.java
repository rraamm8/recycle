package com.project.domain;

import java.util.List;
import java.util.Map;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shapes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShapeEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String label;
	private String shapeType;
	
	@ElementCollection // 값 타입 컬렉션(기본 타입 컬렉션이나 임베디드 객체 컬렉션)을 엔티티에 매핑
	private List<List<Double>> points;
	
	private Integer groupId;
	
	// 여러 개의 ShapeEntity 객체가 하나의 FlaskResultEntity 객체와 연관
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "flask_result_id") // ShapeEntity의 외래 키 컬럼 정의(id)
	private FlaskResultEntity flaskResult;
	
	@ElementCollection
	private Map<String, Object> flags;
	
}
