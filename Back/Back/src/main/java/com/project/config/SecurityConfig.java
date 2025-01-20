package com.project.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.project.config.filter.JWTAuthorizationFilter;
import com.project.filter.JWTAuthenticationFilter;
import com.project.persistence.UsersRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Autowired
	private AuthenticationConfiguration authenticationConfiguration;

	@Autowired
	private UsersRepository usersRepository;

	@Bean
	SecurityFilterChain sequrityFilterChain(HttpSecurity http) throws Exception {

		http.cors(cors -> cors.configurationSource(corsSource())); // -백진 : 예진아 이거 cors 보호 푸는법 입니다.
		http.csrf(cf -> cf.disable()); // CSRF 보호 비활성화

		http.authorizeHttpRequests(auth -> auth
//				.requestMatchers("/user/**").authenticated()
//				.requestMatchers("/admin/**").hasAnyRole("ADMIN")
				.anyRequest().permitAll());

		// Form을 이용한 로그인을 사용하지 않겠다는 설정
		// JWT와 같은 토큰 기반 인증 방식을 사용하려는 경우 폼 기반 로그인을 비활성화
		http.formLogin(frmLogin -> frmLogin.disable());

		// Http Basic 인증 방식을 사용하지 않겠다는 설정
		http.httpBasic(basic -> basic.disable());

		// 세션을 유지하지 않겠다고 설정
		// Url 호출 뒤 응답할 때 까지는 유지되지만 응답 후 삭제된다는 의미
		http.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		// 스프링 시큐리티가 등록한 필터체인의 뒤에 작성한 필터를 추가한다.
		http.addFilter(new JWTAuthenticationFilter(authenticationConfiguration.getAuthenticationManager()));

		// 스프링 시큐리티가 등록한 필터들 중에서 AuthorizationFilter 앞에 앞에서 작성한 필터를 삽입한다.
		http.addFilterBefore(new JWTAuthorizationFilter(usersRepository), AuthorizationFilter.class);

		return http.build();
	}

	private CorsConfigurationSource corsSource() { // -백진 : 예진아 이거 cors 보호 푸는법 입니다.

		CorsConfiguration config = new CorsConfiguration();
		config.addAllowedOriginPattern(CorsConfiguration.ALL);
		config.addAllowedMethod(CorsConfiguration.ALL);
		config.addAllowedHeader(CorsConfiguration.ALL);
		config.setAllowCredentials(true);
		config.addExposedHeader(CorsConfiguration.ALL);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}

//	@Bean
//	SecurityFilterChain filterChain (HttpSecurity http) throws Exception {
//		
//		http.csrf(csrf -> csrf.disable());
//		http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
//		return http.build();
//	}
