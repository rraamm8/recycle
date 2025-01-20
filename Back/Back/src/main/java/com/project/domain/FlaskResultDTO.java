package com.project.domain;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // 자동으로 @Getter, @Setter, @ToString, @EqualsAndHashCode를 생성
@NoArgsConstructor // 기본 생성자 생성
@AllArgsConstructor // 모든 필드를 매개변수로 가지는 생성자 생성
@Builder // 빌더 패턴 지원
public class FlaskResultDTO {
	private String version;
	private Map<String, Object> flags;
	private List<ShapeDTO> shapes;
	private String imagePath;
	private int imageHeight;
	private int imageWidth;

}
