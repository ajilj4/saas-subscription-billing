package in.ajildev.saas_subscription_billing.service;

import in.ajildev.saas_subscription_billing.entity.Payment;
import in.ajildev.saas_subscription_billing.entity.User;
import in.ajildev.saas_subscription_billing.repository.PaymentRepository;
import in.ajildev.saas_subscription_billing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public List<Payment> getPaymentHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
