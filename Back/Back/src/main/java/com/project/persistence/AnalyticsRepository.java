package com.project.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.domain.DetectionsEntity;

@Repository
public interface AnalyticsRepository extends JpaRepository<DetectionsEntity, Long>{
	 @Query(value = """
		        SELECT 
		            DATE_FORMAT(d.detected_at, '%Y-%m-%d %H:00:00') AS timePeriod,
		            d.video_name AS videoName,
		            c.class_name AS bottleType,
		            c.is_recyclable AS recyclable,
		            SUM(a.count) AS totalCount,
		            SUM(a.count * c.carbon_reduction) AS totalCarbonReduction
		        FROM detections d
		        JOIN analytics a ON d.id = a.class_id
		        JOIN classes c ON a.class_id = c.id
		        WHERE d.detected_at BETWEEN :startDate AND :endDate
		        GROUP BY timePeriod, d.video_name, c.class_name, c.is_recyclable
		        ORDER BY timePeriod;
		    """, nativeQuery = true)
		    List<Object[]> findAnalyticsByDateRange(
		        @Param("startDate") String startDate,
		        @Param("endDate") String endDate
		    );
		}