package com.project.domain;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShapeDTO {
	private String label;
	private List<List<Double>> points;
	private Integer groupId;
	private String shapeType;
	private Object inner;
	private Map<String, Object> flags;

}
