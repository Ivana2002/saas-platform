package com.saas.userservice.dto;

import lombok.Data;

@Data
public class UserDTO {
    private String email;
    private String password;
    private String role;
    private String tenantSchema;
}