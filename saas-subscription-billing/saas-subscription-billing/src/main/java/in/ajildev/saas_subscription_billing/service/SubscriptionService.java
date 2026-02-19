package in.ajildev.saas_subscription_billing.service;

import com.razorpay.Order;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import in.ajildev.saas_subscription_billing.entity.Payment;
import in.ajildev.saas_subscription_billing.entity.Plan;
import in.ajildev.saas_subscription_billing.entity.Subscription;
import in.ajildev.saas_subscription_billing.entity.User;
import in.ajildev.saas_subscription_billing.enums.PaymentGateway;
import in.ajildev.saas_subscription_billing.enums.PaymentStatus;
import in.ajildev.saas_subscription_billing.enums.SubscriptionStatus;
import in.ajildev.saas_subscription_billing.repository.PaymentRepository;
import in.ajildev.saas_subscription_billing.repository.PlanRepository;
import in.ajildev.saas_subscription_billing.repository.SubscriptionRepository;
import in.ajildev.saas_subscription_billing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final RazorpayService razorpayService;
    private final PaynProService paynProService;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.api.key}")
    private String razorpayKey;

    @Value("${razorpay.api.secret}")
    private String razorpaySecret;

    @Transactional
    public Map<String, Object> initiateSubscription(Long planId, String email, String gateway)
            throws RazorpayException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        PaymentGateway selectedGateway = PaymentGateway.valueOf(gateway.toUpperCase());
        Map<String, Object> response = new HashMap<>();
        String txnId = "";

        if (selectedGateway == PaymentGateway.RAZORPAY) {
            // 1. Create Razorpay Order
            String receiptId = "txn_" + System.currentTimeMillis();
            Order razorpayOrder = razorpayService.createOrder(plan.getPrice(), receiptId);
            txnId = razorpayOrder.get("id");

            response.put("orderId", txnId);
            response.put("amount", razorpayOrder.get("amount"));
            response.put("currency", "INR");
            response.put("key", razorpayKey);
            response.put("name", "SaaS Subcription");
            response.put("description", "Subscription for " + plan.getName());
        } else if (selectedGateway == PaymentGateway.PAYNPRO) {
            // 1. Create Paynpro Order
            String tradeNo = "PNP_" + System.currentTimeMillis();
            org.json.JSONObject paynproOrder = paynProService.createOrder(
                    plan.getPrice().doubleValue(),
                    tradeNo,
                    user.getName(),
                    user.getEmail(),
                    "0000000000" // Placeholder for missing mobile
            );

            // Based on expected Paynpro response structure
            if (paynproOrder.has("data") && paynproOrder.getJSONObject("data").has("payUrl")) {
                txnId = tradeNo;
                response.put("payUrl", paynproOrder.getJSONObject("data").getString("payUrl"));
                response.put("tradeNo", tradeNo);
            } else {
                throw new RuntimeException("Paynpro initiation failed: " + paynproOrder.toString());
            }
        }

        // 2. Create Pending Subscription
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .status(SubscriptionStatus.PENDING)
                .build();
        subscription = subscriptionRepository.save(subscription);

        // 3. Create Pending Payment
        Payment payment = Payment.builder()
                .user(user)
                .subscription(subscription)
                .gateway(selectedGateway)
                .txnId(txnId)
                .amount(plan.getPrice())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return response;
    }

    @Transactional
    public void activateSubscription(String orderId, String paymentId, String signature) {
        // 1. Verify Signature
        try {
            String secret = razorpaySecret;
            boolean isValid = Utils.verifyPaymentSignature(new org.json.JSONObject()
                    .put("razorpay_order_id", orderId)
                    .put("razorpay_payment_id", paymentId)
                    .put("razorpay_signature", signature), secret);

            if (!isValid) {
                throw new RuntimeException("Invalid payment signature");
            }
        } catch (Exception e) {
            throw new RuntimeException("Signature verification failed", e);
        }

        // 2. Update status
        Payment payment = paymentRepository.findByTxnId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            Subscription subscription = payment.getSubscription();
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setStartDate(LocalDateTime.now());
            subscription.setEndDate(LocalDateTime.now().plusDays(30)); // Default 30 days
            subscriptionRepository.save(subscription);
        }
    }

    public Subscription getCurrentSubscription(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the latest active subscription
        return subscriptionRepository.findByUserAndStatus(user, SubscriptionStatus.ACTIVE)
                .stream()
                .findFirst()
                .orElse(null);
    }
}
