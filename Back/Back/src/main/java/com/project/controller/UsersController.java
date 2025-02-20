package com.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.domain.LoginDTO;
import com.project.domain.UsersDTO;
import com.project.service.UsersService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UsersController {
	private final UsersService usersService;

	public UsersController(UsersService usersService) {
		this.usersService = usersService;
	}

	// 회원가입 API
	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@Valid @RequestBody UsersDTO usersDTO) {
		try {
			usersService.registerUser(usersDTO);
			return ResponseEntity.ok().body(Map.of("message", "회원가입 성공"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
		}
	}

	// 로그인 API
	@PostMapping("/login")
	public ResponseEntity<?> loginUser(@Valid @RequestBody LoginDTO loginDTO) {
		try {
			String token = usersService.loginUser(loginDTO);
			return ResponseEntity.ok(Map.of("message", "로그인 성공", "token", token));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
		}
	}

	//지니가 한고
	// 아이디 중복 확인 API
	@GetMapping("/check-id/{userId}")
	public ResponseEntity<?> checkUserId(@PathVariable String userId) {
		boolean exists = usersService.existsByUserId(userId);
		if (exists) {
			// 아이디가 이미 존재하는 경우
			return ResponseEntity.ok(Map.of("exists", true));
		} else {
			// 아이디가 존재하지 않으므로 사용 가능
			// 404 Not Found로 반환하거나 200 OK로 { exists: false }를 반환할 수 있음
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("exists", false));
		}
	}

	// `@Valid` 유효성 검사 실패 시 (비밀번호 길이 등) 예외 처리
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
		Map<String, String> errorResponse = new HashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			errorResponse.put("error", fieldError.getDefaultMessage());
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
	}

	// 기존 `IllegalArgumentException` 핸들러 유지
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
	}
}