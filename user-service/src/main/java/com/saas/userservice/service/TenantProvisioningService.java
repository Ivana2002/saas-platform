package com.saas.userservice.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantProvisioningService {

    private final JdbcTemplate jdbcTemplate;

    public TenantProvisioningService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void createTenantWithInitialUser(String schemaName, String userEmail, String userName, String userPassword) {
        // 1. Kreiranje nove šeme za klijenta
        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + schemaName);

        // 2. Kreiranje tabele 'users' UNUTAR nove šeme
        jdbcTemplate.execute("CREATE TABLE " + schemaName + ".users (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "email VARCHAR(255) NOT NULL UNIQUE, " +
                "name VARCHAR(255), " +
                "password VARCHAR(255), " +
                "role VARCHAR(50)" +
                ");");

        // 3. Upis prvog korisnika direktno u tu novu šemu
        String insertUserSql = "INSERT INTO " + schemaName + ".users (email, name, password, role) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertUserSql, userEmail, userName, userPassword, "ROLE_ADMIN");
    }
}