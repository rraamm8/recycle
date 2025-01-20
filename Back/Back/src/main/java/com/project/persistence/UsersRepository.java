package com.project.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.domain.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {
	boolean existsByUserId(String userId);
	Users findByuserId(String userId);
}
