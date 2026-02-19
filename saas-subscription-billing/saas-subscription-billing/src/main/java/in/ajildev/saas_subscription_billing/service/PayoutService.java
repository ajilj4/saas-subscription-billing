package in.ajildev.saas_subscription_billing.service;

import in.ajildev.saas_subscription_billing.entity.Payout;
import in.ajildev.saas_subscription_billing.entity.Subscription;
import in.ajildev.saas_subscription_billing.entity.User;
import in.ajildev.saas_subscription_billing.enums.PaymentGateway;
import in.ajildev.saas_subscription_billing.enums.PayoutStatus;
import in.ajildev.saas_subscription_billing.repository.PayoutRepository;
import in.ajildev.saas_subscription_billing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final PaynProService paynProService;
    private final UserRepository userRepository;

    /**
     * Triggered when a subscription is activated.
     */
    @Transactional
    public void processPayoutForSubscription(Subscription subscription) {
        if (subscription.getPlan().getPayoutAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            log.info("No payout amount defined for plan: {}", subscription.getPlan().getName());
            return;
        }

        User user = subscription.getUser();
        if (user.getPayoutAccountNo() == null || user.getPayoutIfsc() == null) {
            log.warn("User {} has no payout details set. Skipping payout initiation.", user.getEmail());
            // Create a pending record to be processed later when user updates details
            savePayoutRecord(subscription, PayoutStatus.FAILED, "Missing bank details");
            return;
        }

        Payout payout = Payout.builder()
                .user(user)
                .subscription(subscription)
                .amount(subscription.getPlan().getPayoutAmount())
                .payoutRef("POUT_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(PayoutStatus.PENDING)
                .gateway(subscription.getPayments().get(0).getGateway()) // Use same gateway as payment for now
                .beneficiaryName(user.getPayoutBeneficiaryName())
                .accountNo(user.getPayoutAccountNo())
                .ifsc(user.getPayoutIfsc())
                .bankName(user.getPayoutBankName())
                .purpose("SaaS Plan Payout - " + subscription.getPlan().getName())
                .build();

        payout = payoutRepository.save(payout);

        if (payout.getGateway() == PaymentGateway.PAYNPRO) {
            initiatePaynProPayout(payout);
        } else {
            log.info("Razorpay Payout implementation pending.");
        }
    }

    private void initiatePaynProPayout(Payout payout) {
        try {
            JSONObject response = paynProService.initiatePayout(payout);
            log.info("PaynPro Payout Response: {}", response);

            payout.setResponseJson(response.toString());
            if (response.has("statusCode") && response.getInt("statusCode") == 200) {
                if (response.has("Data")) {
                    payout.setTxnId(response.getJSONObject("Data").optString("txn_id"));
                    payout.setStatus(PayoutStatus.PROCESSING);
                }
            } else {
                payout.setStatus(PayoutStatus.FAILED);
            }
        } catch (Exception e) {
            log.error("PaynPro Payout failed to initiate: {}", e.getMessage());
            payout.setStatus(PayoutStatus.FAILED);
        }
        payoutRepository.save(payout);
    }

    private void savePayoutRecord(Subscription subscription, PayoutStatus status, String purpose) {
        Payout payout = Payout.builder()
                .user(subscription.getUser())
                .subscription(subscription)
                .amount(subscription.getPlan().getPayoutAmount())
                .payoutRef("POUT_ERR_" + System.currentTimeMillis())
                .status(status)
                .gateway(PaymentGateway.PAYNPRO)
                .purpose(purpose)
                .build();
        payoutRepository.save(payout);
    }

    public List<Payout> getUserPayouts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return payoutRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void updateBeneficiaryDetails(String email, String accountNo, String ifsc, String beneficiaryName,
            String bankName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPayoutAccountNo(accountNo);
        user.setPayoutIfsc(ifsc);
        user.setPayoutBeneficiaryName(beneficiaryName);
        user.setPayoutBankName(bankName);
        userRepository.save(user);
    }
}
