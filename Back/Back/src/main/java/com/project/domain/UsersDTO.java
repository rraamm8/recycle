package com.project.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsersDTO {
	@NotBlank(message = "이름은 필수 입력 사항입니다.")
	private String name;
	
	@NotBlank(message = "아이디는 필수 입력 사항입니다.")
	@Size(min = 6, max = 20, message = "아이디는 6자 이상 20자 이하로 입력해야 합니다.")
	private String userId;
	
	@NotBlank(message = "비밀번호는 필수 입력 사항입니다.")
	@Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다.")
	private String password;

}
