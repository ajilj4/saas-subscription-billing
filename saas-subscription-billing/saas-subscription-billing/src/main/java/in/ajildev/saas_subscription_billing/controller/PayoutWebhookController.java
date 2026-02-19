package in.ajildev.saas_subscription_billing.controller;

import in.ajildev.saas_subscription_billing.entity.Payout;
import in.ajildev.saas_subscription_billing.enums.PayoutStatus;
import in.ajildev.saas_subscription_billing.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payout/paynpro-payout-webhook-response")
@RequiredArgsConstructor
@Slf4j
public class PayoutWebhookController {

    private final PayoutRepository payoutRepository;

    @PostMapping
    public ResponseEntity<String> handlePayoutWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Received PaynPro Payout Webhook: {}", payload);

        try {
            String payoutRef = (String) payload.get("PAYOUT_REF");
            String status = (String) payload.get("STATUS");
            String txnId = (String) payload.get("TXN_ID");

            if (payoutRef == null || status == null) {
                log.warn("Invalid webhook payload: missing PAYOUT_REF or STATUS");
                return ResponseEntity.ok("Invalid Payload");
            }

            Payout payout = payoutRepository.findByPayoutRef(payoutRef)
                    .orElseThrow(() -> new RuntimeException("Payout record not found for Ref: " + payoutRef));

            if ("Success".equalsIgnoreCase(status)) {
                payout.setStatus(PayoutStatus.SUCCESS);
            } else if ("Failed".equalsIgnoreCase(status)) {
                payout.setStatus(PayoutStatus.FAILED);
            }

            payout.setTxnId(txnId);
            payout.setResponseJson(payload.toString());
            payoutRepository.save(payout);

            log.info("Payout status updated for Ref: {} to {}", payoutRef, status);
            return ResponseEntity.ok("SUCCESS");

        } catch (Exception e) {
            log.error("Error processing Payout Webhook: {}", e.getMessage());
            return ResponseEntity.ok("ERROR");
        }
    }
}
