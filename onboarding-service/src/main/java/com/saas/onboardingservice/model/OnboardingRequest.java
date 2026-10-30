package com.saas.onboardingservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "onboarding_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class OnboardingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String adminEmail;
    private String adminPassword;
    private String additionalInfo;

    @Enumerated(EnumType.STRING)
    private OnboardingStatus status = OnboardingStatus.PENDING;
}