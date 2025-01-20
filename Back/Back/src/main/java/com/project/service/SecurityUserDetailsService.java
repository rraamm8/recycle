package com.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.project.domain.Users;
import com.project.persistence.UsersRepository;

@Service
public class SecurityUserDetailsService implements UserDetailsService {
	
	@Autowired
	private UsersRepository userRepo;
	
	
	@Override
	public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
		// 데이터베이스에서 사용자 정보 조회
		// userId는 Long 타입이어야 합니다.
		Users users = userRepo.findByuserId(userId); // String -> Long 변환 필요
		if (users == null) {
			throw new UsernameNotFoundException("user not found");
		}
		
		// Spring Security의 User 객체 생성 후 반환
		return new User(String.valueOf(users.getUserId()), users.getPassword(),
					AuthorityUtils.createAuthorityList(users.toString()));
	}

}
