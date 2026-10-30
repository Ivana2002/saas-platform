package com.saas.onboardingservice.repository;

import com.saas.onboardingservice.model.OnboardingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnboardingRequestRepository extends JpaRepository<OnboardingRequest, Long> {
}