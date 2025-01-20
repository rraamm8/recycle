package com.project.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.domain.FlaskResultEntity;

public interface FlaskResultRepository extends JpaRepository<FlaskResultEntity, Long>{

}
