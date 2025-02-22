package com.project.config.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.project.domain.Users;
import com.project.persistence.UsersRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JWTAuthorizationFilter extends OncePerRequestFilter {
	// 인가 설정을 위해 사용자의 Role 정보를 읽어 들이기 위한 객체 설정
	private final UsersRepository usersRepository;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {
		String srcToken = request.getHeader("Authorization"); // 요청 헤더에서 Authorization을 얻어온다.
		if (srcToken == null || !srcToken.startsWith("Bearer")) { // 없거나 "Bearer"로 시작하지 않는다면
			filterChain.doFilter(request, response); // 필터를 그냥 통과
			return;
		}
		
		String jwtToken = srcToken.replace("Bearer ", ""); // 토큰에서 "Bearer"를 제거
		
		// 토큰에서 userId를 추출
		String userId = JWT.require(Algorithm.HMAC256("com.project.jwt")).build().verify(jwtToken).getClaim("userId").asString();
		
		Users findusers = usersRepository.findByuserId(userId); // 토큰에서 얻은 userId로 DB를 검색해서 사용자를 검색
		
		if (findusers == null) { // 사용자가 존재하지 않는다면
			filterChain.doFilter(request, response); // 필터를 그냥 통과
			return;
		}
		
		// DB에서 읽은 사용자 정보를 이용해서 UserDetails 타입의 객체를 생성
		User user = new User(findusers.getUserId(),findusers.getPassword(),
								AuthorityUtils.createAuthorityList(findusers.toString()));
		
		// Authentication 객체를 생성 : 사용자명과 권한 관리를 위한 정보를 입력(암호는 필요 없음)
		Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
		
		// 시큐리티 세션에 등록한다.
		SecurityContextHolder.getContext().setAuthentication(auth);
		
		filterChain.doFilter(request, response);
	}

}
// OncePerRequestFilter를 상속받게 되면 하나의 요청에 대해서 단 한번만 필터를 거치게 된다.
// 예를 들어 forwarding 되어 다른 페이지로 이동하게 되더라도 다시 이 필터를 거치지 않게 한다.
