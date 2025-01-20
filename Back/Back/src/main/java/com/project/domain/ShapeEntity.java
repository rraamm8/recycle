package com.project.domain;

import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
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
	
	@ElementCollection // 값 타입 컬렉션(기본 타입 컬렉션이나 임베디드 객체 컬렉션)을 엔티티에 매핑
	// @CollectionTable: 값 타입 컬렉션을 저장할 테이블 정의
	@CollectionTable(name = "shape_points", joinColumns = @JoinColumn(name = "shape_id")) // 테이블에 외래 키로 사용할 컬럼을 지정(id 컬럼을 참조)
	@Column(name = "point")
	private List<String> points; // [x, y] 좌표를 문자열로 저장
	
	// 여러 개의 ShapeEntity 객체가 하나의 FlaskResultEntity 객체와 연관
	@ManyToOne
	@JoinColumn(name = "flask_result_id") // ShapeEntity의 외래 키 컬럼 정의(id)
	private FlaskResultEntity flaskResult;
	
}
