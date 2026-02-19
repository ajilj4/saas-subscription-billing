package in.ajildev.saas_subscription_billing.controller;

import in.ajildev.saas_subscription_billing.service.PaynProService;
import in.ajildev.saas_subscription_billing.service.PayoutService;
import in.ajildev.saas_subscription_billing.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;
    private final PaynProService paynProService;
    private final RazorpayService razorpayService;

    @GetMapping("/balance")
    public ResponseEntity<?> getPayoutBalance() {
        Map<String, Object> balances = new java.util.HashMap<>();
        try {
            JSONObject pnpResponse = paynProService.fetchBalance();
            balances.put("paynpro", pnpResponse.toMap());
        } catch (Exception e) {
            balances.put("paynpro", Map.of("error", e.getMessage()));
        }

        try {
            JSONObject rzpResponse = razorpayService.fetchBalance();
            balances.put("razorpay", rzpResponse.toMap());
        } catch (Exception e) {
            balances.put("razorpay", Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(balances);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPayouts() {
        return ResponseEntity.ok(payoutService.getAllPayouts());
    }

    @PostMapping("/update-bank-details")
    public ResponseEntity<?> updateBankDetails(@RequestBody Map<String, String> request) {
        payoutService.updateBeneficiaryDetails(
                request.get("email"),
                request.get("accountNo"),
                request.get("ifsc"),
                request.get("beneficiaryName"),
                request.get("bankName"));
        return ResponseEntity.ok(Map.of("message", "Bank details updated successfully"));
    }

    @GetMapping("/history/{email}")
    public ResponseEntity<?> getPayoutHistory(@PathVariable String email) {
        return ResponseEntity.ok(payoutService.getUserPayouts(email));
    }

    @GetMapping("/status/{payoutRef}")
    public ResponseEntity<?> getPayoutStatus(@PathVariable String payoutRef) {
        JSONObject response = paynProService.getPayoutStatus(payoutRef);
        return ResponseEntity.ok(response.toMap());
    }

    @PostMapping("/report")
    public ResponseEntity<?> getPayoutReport(@RequestBody Map<String, String> request) {
        JSONObject response = paynProService.getTxnReport(request.get("startDate"), request.get("endDate"));
        return ResponseEntity.ok(response.toMap());
    }

    @PostMapping("/statement")
    public ResponseEntity<?> getPayoutStatement(@RequestBody Map<String, String> request) {
        JSONObject response = paynProService.getStatement(request.get("startDate"), request.get("endDate"));
        return ResponseEntity.ok(response.toMap());
    }

    @PostMapping("/initiate-manual")
    public ResponseEntity<?> initiateManualPayout(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        java.math.BigDecimal amount = new java.math.BigDecimal(request.get("amount").toString());
        String purpose = (String) request.get("purpose");
        String gatewayStr = (String) request.get("gateway");
        in.ajildev.saas_subscription_billing.enums.PaymentGateway gateway = gatewayStr != null
                ? in.ajildev.saas_subscription_billing.enums.PaymentGateway.valueOf(gatewayStr.toUpperCase())
                : null;

        return ResponseEntity.ok(payoutService.initiateManualPayout(email, amount, purpose, gateway));
    }
}
