package com.saas.onboardingservice.dto;

import lombok.Data;

@Data
public class OnboardingRequestDTO {
    private String companyName;
    private String adminEmail;
    private String adminPassword; // Dodano polje
    private String additionalInfo;
}