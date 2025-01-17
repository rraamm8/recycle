package com.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.domain.Users;
import com.project.service.UsersService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class SecurityController {
	private final UsersService usersService;
	
	public SecurityController(UsersService usersService) {
		this.usersService = usersService;
	}
	
	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@Valid @RequestBody Users users) {
		usersService.registerUser(users);
		return ResponseEntity.ok("회원가입 성공"); // 성공메시지
	}

}
