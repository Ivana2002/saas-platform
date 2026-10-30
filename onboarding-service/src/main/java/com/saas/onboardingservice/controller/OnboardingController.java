package com.saas.onboardingservice.controller;

import com.saas.onboardingservice.dto.OnboardingRequestDTO;
import com.saas.onboardingservice.model.OnboardingRequest;
import com.saas.onboardingservice.service.OnboardingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingController {

    @Autowired
    private OnboardingService service;

    @PostMapping("/request")
    public OnboardingRequest createRequest(@RequestBody OnboardingRequestDTO dto) {
        return service.createRequest(dto);
    }

    @GetMapping("/requests")
    public List<OnboardingRequest> getAllRequests() {
        return service.getAllRequests();
    }

    @PutMapping("/request/{id}/approve")
    public OnboardingRequest approveRequest(@PathVariable Long id) {
        return service.approveRequest(id);
    }

    @PutMapping("/request/{id}/reject")
    public OnboardingRequest rejectRequest(@PathVariable Long id) {
        return service.rejectRequest(id);
    }
}