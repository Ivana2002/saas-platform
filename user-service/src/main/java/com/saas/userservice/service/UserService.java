package com.saas.userservice.service;

import com.saas.userservice.dto.UserDTO;
import com.saas.userservice.model.User;
import com.saas.userservice.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;
    private final JdbcTemplate jdbcTemplate;

    public UserService(UserRepository repository, JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public User createAdminUser(String schemaName, String email) {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + schemaName + ".users (" +
                "id SERIAL PRIMARY KEY, " +
                "email VARCHAR(255), " +
                "password VARCHAR(255), " +
                "role VARCHAR(50), " +
                "tenant_schema VARCHAR(255))");

        User admin = new User();
        admin.setEmail(email);
        admin.setPassword("admin123");
        admin.setRole("ADMIN");
        admin.setTenantSchema(schemaName);

        return repository.save(admin);
    }

    public User createUser(UserDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole() != null ? dto.getRole() : "USER");
        user.setTenantSchema(dto.getTenantSchema());
        return repository.save(user);
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public void deleteUser(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public User updateUser(Long id, UserDTO dto) {
        User existingUser = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setEmail(dto.getEmail());

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            existingUser.setRole(dto.getRole());
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            existingUser.setPassword(dto.getPassword());
        }

        return repository.save(existingUser);
    }
}