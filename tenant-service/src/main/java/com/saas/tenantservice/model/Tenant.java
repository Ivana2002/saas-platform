package com.saas.tenantservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String adminEmail;

    @Column(nullable = false)
    private String schemaName;
}