package in.ajildev.saas_subscription_billing.controller;

import in.ajildev.saas_subscription_billing.service.PaynProService;
import in.ajildev.saas_subscription_billing.service.PayoutService;
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

    @GetMapping("/balance")
    public ResponseEntity<?> getPayoutBalance() {
        JSONObject response = paynProService.fetchBalance();
        return ResponseEntity.ok(response.toMap());
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
}
