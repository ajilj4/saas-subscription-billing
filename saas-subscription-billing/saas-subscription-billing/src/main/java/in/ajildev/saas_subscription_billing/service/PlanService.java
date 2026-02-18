package in.ajildev.saas_subscription_billing.service;

import in.ajildev.saas_subscription_billing.entity.Plan;
import in.ajildev.saas_subscription_billing.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }
}
