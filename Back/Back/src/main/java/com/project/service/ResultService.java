package com.project.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.domain.ResultDTO;
import com.project.persistence.ResultRepository;

@Service
public class ResultService {
	private final ResultRepository resultRepository;

	// 생성자 주입
	public ResultService(ResultRepository resultRepository) {
		this.resultRepository = resultRepository;
	}

	public List<ResultDTO> getDetectionReport() {
    	// Native Query 결과를 가져옴
        List<Object[]> rawData = resultRepository.fetchDetectionReport();
        
        // Object[]를 ResultDTO로 변환
        return rawData.stream().map(data -> {

            String dayOfWeek = (String) data[0];
            String timePeriod = (String) data[1];
            String videoName = (String) data[2];
            String bottleType = (String) data[3];

            // recyclable이 SQL에서 CASE WHEN으로 이미 boolean 만들었어도 
            // 드라이버가 Integer로 받을 가능성이 있으므로 안전하게 변환
            Object recyclableObj = data[4];
            Boolean recyclable;

            if (recyclableObj instanceof Boolean) {
                // 드라이버가 실제로 Boolean으로 파싱했을 경우
                recyclable = (Boolean) recyclableObj;
            } else if (recyclableObj instanceof Number) {
                // 드라이버가 Integer, Byte 등 Number로 파싱했을 경우
                recyclable = ((Number) recyclableObj).intValue() == 1;
            } else {
                // null 또는 기타 타입
                recyclable = false;
            }

            Long totalCount = ((Number) data[5]).longValue();
            Double totalCarbonReduction = ((Number) data[6]).doubleValue();

            return new ResultDTO(
                dayOfWeek,
                timePeriod,
                videoName,
                bottleType,
                recyclable,
                totalCount,
                totalCarbonReduction
            );
        }).collect(Collectors.toList());
    }
}