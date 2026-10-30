package com.saas.onboardingservice.client;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class TenantClient {

    @Autowired
    private RestTemplate restTemplate;

    public void createTenant(String companyName, String adminEmail, String adminPassword) {
        String url = "http://localhost:8082/api/tenants/create?companyName=" + companyName
                + "&adminEmail=" + adminEmail
                + "&adminPassword=" + adminPassword;

        restTemplate.postForEntity(url, null, String.class);
    }
}