package com.saas.tenantservice.controller;

import com.saas.tenantservice.model.Tenant;
import com.saas.tenantservice.service.TenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "*")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/create")
    public ResponseEntity<Tenant> createTenant(@RequestParam String companyName,
                                               @RequestParam String adminEmail,
                                               @RequestParam String adminPassword) {
        Tenant tenant = tenantService.createTenant(companyName, adminEmail, adminPassword);
        return ResponseEntity.ok(tenant);
    }
}