package com.saas.tenantservice.service;

import com.saas.tenantservice.model.Tenant;
import com.saas.tenantservice.repository.TenantRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;

    public TenantService(TenantRepository tenantRepository, JdbcTemplate jdbcTemplate) {
        this.tenantRepository = tenantRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Tenant createTenant(String companyName, String adminEmail, String adminPassword) {
        // Generisanje sigurnog imena šeme (npr. schema_tehnologija_doo)
        String schemaName = "schema_" + companyName.toLowerCase().replaceAll("[^a-z0-9]", "_");

        Tenant tenant = new Tenant();
        tenant.setCompanyName(companyName);
        tenant.setAdminEmail(adminEmail);
        tenant.setSchemaName(schemaName);

        // 1. Snimanje tenanta u glavnu bazu (public/zajedničku šemu)
        Tenant savedTenant = tenantRepository.save(tenant);

        // 2. Automatsko kreiranje nove PostgreSQL šeme za izolaciju podataka
        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + schemaName);

        // 3. Kreiranje tabele 'users' sa uključenom 'password' kolonom
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".users (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "email VARCHAR(255) NOT NULL UNIQUE, " +
                "password VARCHAR(255), " +
                "name VARCHAR(255), " +
                "role VARCHAR(50)" +
                ");");

        // 4. Automatska dopuna kolone ako je šema već postojala od ranije bez password-a
        jdbcTemplate.execute("ALTER TABLE " + schemaName + ".users ADD COLUMN IF NOT EXISTS password VARCHAR(255);");

        // 5. Upis prvog korisnika sa pravom lozinkom iz zahtjeva
        String insertUserSql = "INSERT INTO " + schemaName + ".users (email, password, name, role) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertUserSql, adminEmail, adminPassword, companyName, "ROLE_ADMIN");

        return savedTenant;
    }
}