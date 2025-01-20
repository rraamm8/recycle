package com.project.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.domain.Users;
import com.project.persistence.UsersRepository;

@Service
public class UsersService {
	private final UsersRepository usersRepository;
	private final PasswordEncoder passwordEncoder;

	public UsersService(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
		this.usersRepository = usersRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public void registerUser(Users users) {
		// 비밀번호 암호화
		String encodPassword = passwordEncoder.encode(users.getPassword());
		users.setPassword(encodPassword);
		
		// 사용자 저장
		usersRepository.save(users);
		}

}
