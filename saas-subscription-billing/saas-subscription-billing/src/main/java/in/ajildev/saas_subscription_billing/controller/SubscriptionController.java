package in.ajildev.saas_subscription_billing.controller;

import com.razorpay.RazorpayException;
import in.ajildev.saas_subscription_billing.entity.Subscription;
import in.ajildev.saas_subscription_billing.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiate(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) throws RazorpayException {

        Long planId = Long.valueOf(request.get("planId").toString());
        String gateway = (String) request.getOrDefault("gateway", "razorpay");

        return ResponseEntity.ok(subscriptionService.initiateSubscription(planId, userDetails.getUsername(), gateway));
    }

    @PostMapping("/activate")
    public ResponseEntity<String> activate(
            @RequestBody Map<String, String> request) {

        String orderId = request.get("orderId");
        String paymentId = request.get("paymentId");
        String signature = request.get("signature");

        subscriptionService.activateSubscription(orderId, paymentId, signature);
        return ResponseEntity.ok("Subscription activated successfully");
    }

    @GetMapping("/current")
    public ResponseEntity<Subscription> getCurrent(@AuthenticationPrincipal UserDetails userDetails) {
        Subscription subscription = subscriptionService.getCurrentSubscription(userDetails.getUsername());
        if (subscription == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(subscription);
    }
}
