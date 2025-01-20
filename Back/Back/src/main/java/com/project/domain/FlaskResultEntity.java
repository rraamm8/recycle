package com.project.domain;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flask_results")
@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode 자동 생성
@NoArgsConstructor // 기본 생성자 생성
@AllArgsConstructor // 모든 필드를 매개변수로 받는 생성자 생성
@Builder // 빌더 패턴 지원
public class FlaskResultEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String version;
	private String imagePath;
	private int imageHeight;
	private int imageWidth;
	
	// 하나의 FlaskResultEntity 객체가 여러 개의 ShapeEntity 객체와 연관될 때 사용
	@OneToMany(cascade = CascadeType.ALL, mappedBy = "flaskResult")
	private List<ShapeEntity> shapes;
	
}
