package com.project.service;

import java.util.Date;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.project.domain.LoginDTO;
import com.project.domain.Users;
import com.project.domain.UsersDTO;
import com.project.persistence.UsersRepository;

@Service
public class UsersService {
	private final UsersRepository usersRepository;
	private final PasswordEncoder passwordEncoder;

	public UsersService(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
		this.usersRepository = usersRepository;
		this.passwordEncoder = passwordEncoder;
	}

	// 사용자 회원가입
	public String registerUser(UsersDTO usersDTO) {
		// 1. 필수 입력값 검증
		if (usersDTO.getName() == null || usersDTO.getName().trim().isEmpty()) {
			throw new IllegalArgumentException("이름은 필수 입력 사항입니다.");
		}
		if (usersDTO.getUserId() == null || usersDTO.getUserId().trim().isEmpty()) {
			throw new IllegalArgumentException("아이디는 필수 입력 사항입니다.");
		}
		if (usersDTO.getPassword() == null || usersDTO.getPassword().trim().isEmpty()) {
			throw new IllegalArgumentException("비밀번호는 필수 입력 사항입니다.");
		}
		
		// 2. 중복 아이디 체크
		if (usersRepository.existsByUserId(usersDTO.getUserId())) {
			throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
		}
		
		// 3. 비밀번호 길이 검증
		if (usersDTO.getPassword().length() < 6) {
			throw new IllegalArgumentException("비밀번호는 최소 6자 이상이어야 합니다.");
		}
		
		// 4. 비밀번호 암호화
		String encodPassword = passwordEncoder.encode(usersDTO.getPassword());
		
		// 5. UsersEntity 객체 생성 및 저장
		Users newUser = new Users();
		newUser.setName(usersDTO.getName());
		newUser.setUserId(usersDTO.getUserId());
		newUser.setPassword(encodPassword);
		
		usersRepository.save(newUser); // 사용자 저장
		
		return "회원가입 성공";
		
		}
	
	// 사용자 로그인
	public String loginUser(LoginDTO loginDTO) {
		// 1. 아이디 존재 여부 확인
		Users user = usersRepository.findByuserId(loginDTO.getUserId());
		if (user == null) {
			throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
		}
		
		// 2. 비밀번호 검증
		if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
			throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
		}
		
		// 3. JWT 토큰 생성
		String token = JWT.create()
				.withSubject(user.getUserId())
				.withExpiresAt(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1시간 유효
				.sign(Algorithm.HMAC256("com.project.jwt"));
		
		return token;
				
	}
	
	//지니가 한고
	// 아이디 존재 여부 확인 (중복 체크용)
    public boolean existsByUserId(String userId) {
        return usersRepository.existsByUserId(userId);
    }

}
