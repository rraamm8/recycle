package com.project.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class Users {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	@NotBlank
	private String name; // 사용자 이름
	
	@Column(unique = true, nullable = false)
	@NotBlank
	@Size(min = 6, max = 20)
	private String userId; // 사용자 아이디 (로그인용)
	
	@Column(nullable = false)
	@NotBlank
	@Size(min = 6)
	private String password; // 비밀번호 (해싱됨)
	
	@Column(nullable = false, updatable = false)
	private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now(); // 생성일

}
