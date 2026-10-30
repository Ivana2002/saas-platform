package com.saas.onboardingservice.service;

import com.saas.onboardingservice.client.TenantClient;
import com.saas.onboardingservice.dto.OnboardingRequestDTO;
import com.saas.onboardingservice.model.OnboardingRequest;
import com.saas.onboardingservice.model.OnboardingStatus;
import com.saas.onboardingservice.repository.OnboardingRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OnboardingService {

    private final OnboardingRequestRepository repository;
    private final TenantClient tenantClient;

    public OnboardingService(OnboardingRequestRepository repository, TenantClient tenantClient) {
        this.repository = repository;
        this.tenantClient = tenantClient;
    }

    public OnboardingRequest createRequest(OnboardingRequestDTO dto) {
        OnboardingRequest request = new OnboardingRequest();
        request.setCompanyName(dto.getCompanyName());
        request.setAdminEmail(dto.getAdminEmail());
        request.setAdminPassword(dto.getAdminPassword());
        request.setAdditionalInfo(dto.getAdditionalInfo());
        request.setStatus(OnboardingStatus.PENDING);
        return repository.save(request);
    }

    public List<OnboardingRequest> getAllRequests() {
        return repository.findAll();
    }

    public OnboardingRequest approveRequest(Long id) {
        OnboardingRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Zahtjev nije pronadjen"));

        request.setStatus(OnboardingStatus.APPROVED);
        repository.save(request);

        // Dodat treći parametar: request.getAdminPassword()
        tenantClient.createTenant(request.getCompanyName(), request.getAdminEmail(), request.getAdminPassword());

        return request;
    }

    public OnboardingRequest rejectRequest(Long id) {
        OnboardingRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Zahtjev nije pronadjen"));

        request.setStatus(OnboardingStatus.REJECTED);
        return repository.save(request);
    }
}