package in.ajildev.saas_subscription_billing.controller;

import in.ajildev.saas_subscription_billing.entity.Payment;
import in.ajildev.saas_subscription_billing.entity.Subscription;
import in.ajildev.saas_subscription_billing.enums.PaymentStatus;
import in.ajildev.saas_subscription_billing.enums.SubscriptionStatus;
import in.ajildev.saas_subscription_billing.repository.PaymentRepository;
import in.ajildev.saas_subscription_billing.repository.SubscriptionRepository;
import in.ajildev.saas_subscription_billing.service.PaynProService;
import in.ajildev.saas_subscription_billing.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

    private final PaynProService paynProService;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        log.info("Received Razorpay Webhook");

        // 1. Verify Signature
        if (!razorpayService.verifyWebhookSignature(payload, signature, webhookSecret)) {
            log.error("Invalid Razorpay Signature");
            return ResponseEntity.status(400).body("Invalid signature");
        }

        // 2. Parse Payload
        JSONObject json = new JSONObject(payload);
        String event = json.getString("event");

        if ("order.paid".equals(event)) {
            JSONObject orderEntity = json.getJSONObject("payload").getJSONObject("order").getJSONObject("entity");
            String razorpayOrderId = orderEntity.getString("id");

            Payment payment = paymentRepository.findByTxnId(razorpayOrderId)
                    .orElseThrow(
                            () -> new RuntimeException("Payment record not found for Order ID: " + razorpayOrderId));

            if (payment.getStatus() == PaymentStatus.PENDING) {
                // Update Payment
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(payment);

                // Update Subscription
                Subscription subscription = payment.getSubscription();
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setStartDate(LocalDateTime.now());

                // Set default duration (e.g., 30 days)
                subscription.setEndDate(LocalDateTime.now().plusDays(30));
                subscriptionRepository.save(subscription);

                log.info("Subscription activated for Order ID: {}", razorpayOrderId);
            }
        } else if ("payment.failed".equals(event)) {
            JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String razorpayOrderId = paymentEntity.getString("order_id");

            paymentRepository.findByTxnId(razorpayOrderId).ifPresent(p -> {
                p.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(p);
                log.warn("Payment failed for Order ID: {}", razorpayOrderId);
            });
        }

        return ResponseEntity.ok("Webhook processed successfully");
    }

    @PostMapping("/paynpro")
    public ResponseEntity<String> handlePaynproWebhook(
            @RequestBody java.util.Map<String, Object> payload) {

        log.info("Received Paynpro Webhook: {}", payload);

        // Note: Signature verification depends on Paynpro's response format
        // For now, we activate based on success status
        String status = (String) payload.get("status");
        String tradeNo = (String) payload.get("tradeNo");

        if ("SUCCESS".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)) {
            Payment payment = paymentRepository.findByTxnId(tradeNo)
                    .orElseThrow(() -> new RuntimeException("Payment record not found for Trade No: " + tradeNo));

            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(payment);

                Subscription subscription = payment.getSubscription();
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setStartDate(LocalDateTime.now());
                subscription.setEndDate(LocalDateTime.now().plusDays(30));
                subscriptionRepository.save(subscription);

                log.info("Paynpro Subscription activated for Trade No: {}", tradeNo);
            }
        }

        return ResponseEntity.ok("success");
    }
}
