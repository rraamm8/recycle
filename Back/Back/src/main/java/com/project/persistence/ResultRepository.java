package com.project.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.domain.DetectionsEntity;

@Repository
public interface ResultRepository extends JpaRepository<DetectionsEntity, Long> {

    @Query(value = """
        SELECT 
            DAYNAME(d.detected_at) AS dayOfWeek,
            DATE_FORMAT(d.detected_at, '%Y-%m-%d %H:00:00') AS timePeriod,
            d.video_name AS videoName,
            c.class_name AS bottleType,
            CASE WHEN c.is_recyclable = 1 THEN TRUE ELSE FALSE END AS recyclable,
            COUNT(d.id) AS totalCount,
            SUM(c.carbon_reduction) AS totalCarbonReduction
        FROM detections d
        LEFT JOIN classes c ON d.class_name = c.class_name
        GROUP BY
            dayOfWeek, timePeriod, videoName, bottleType, recyclable
        ORDER BY 
            FIELD(dayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
            timePeriod
        """, 
        nativeQuery = true)
    List<Object[]> fetchDetectionReport();
}
