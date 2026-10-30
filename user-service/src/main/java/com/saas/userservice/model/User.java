package com.saas.userservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String name; // Dodato pošto postoji kolona u bazi
    private String role; // ADMIN, USER

    @Transient // Sprečava Hibernate da traži nepostojeću kolonu "tenantSchema" u bazi
    private String tenantSchema;
}