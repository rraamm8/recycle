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
	private String name;
	
	@Column(unique = true, nullable = false)
	@NotBlank
	@Size(min = 6, max = 20)
	private String userId;
	
	@Column(nullable = false)
	@NotBlank
	@Size(min = 6)
	private String password;
	
//	private String role = "user";
	
	@Column(nullable = false, updatable = false)
	private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

}
