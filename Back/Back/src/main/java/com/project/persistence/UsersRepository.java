package com.project.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.domain.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {
	boolean existsByUserId(String userId); // 아이디 중복 검사
	Users findByuserId(String userId); // 특정 아이디로 유저 조회
}
