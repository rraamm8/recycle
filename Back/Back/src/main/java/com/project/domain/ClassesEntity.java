package com.project.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "classes")
@Getter
@Setter
public class ClassesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_name")
    private String className; // 병 종류

    @Column(name = "is_recyclable")
    private int isRecyclable; // 재활용 가능 여부(1: 가능, 0: 불가능)

    @Column(name = "carbon_reduction")
    private Float carbonReduction; // 탄소 절감량
    
}
