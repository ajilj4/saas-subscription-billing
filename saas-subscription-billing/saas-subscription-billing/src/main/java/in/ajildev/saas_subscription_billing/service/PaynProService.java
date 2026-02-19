package in.ajildev.saas_subscription_billing.service;

import in.ajildev.saas_subscription_billing.entity.Payout;
import in.ajildev.saas_subscription_billing.security.PaynproUtil;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaynProService {

    private final WebClient webClient;

    @Value("${paynpro.api.key}")
    private String apiKey;

    @Value("${paynpro.api.secret}")
    private String secretKey;

    @Value("${paynpro.api.encryptionKey}")
    private String encryptionKey;

    @Value("${paynpro.api.saltKey}")
    private String saltKey;

    @Value("${paynpro.base.url}")
    private String baseUrl;

    @Value("${paynpro.payout.url}")
    private String payoutUrl;

    private final WebClient payoutWebClient;

    public PaynProService(WebClient.Builder builder,
            @Value("${paynpro.base.url}") String baseUrl,
            @Value("${paynpro.payout.url}") String payoutUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.payoutWebClient = builder.baseUrl(payoutUrl).build();
    }

    /**
     * Fetch PaynPro Payout Balance
     */
    public JSONObject fetchBalance() {
        String response = payoutWebClient.post()
                .uri("/payout/v1/fetchBalance")
                .header("X-APIKEY", apiKey)
                .header("X-APISECRET", secretKey)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return new JSONObject(response);
    }

    /**
     * Initiate a Payout via PaynPro
     */
    public JSONObject initiatePayout(Payout payout) {
        String signature = PaynproUtil.generateSignature(
                secretKey,
                payout.getBeneficiaryName(),
                payout.getUser().getEmail(),
                payout.getUser().getName(),
                payout.getAmount().toString(),
                payout.getPayoutRef(),
                "IMPS" // Defaulting to IMPS as per doc
        );

        JSONObject request = new JSONObject();
        request.put("username", payout.getUser().getName());
        request.put("email_id", payout.getUser().getEmail());
        request.put("mob_no", "0000000000"); // Should be taken from User if available
        request.put("amount", payout.getAmount().toString());
        request.put("payout_ref", payout.getPayoutRef());
        request.put("txn_type", "IMPS");
        request.put("recv_bank_ifsc", payout.getIfsc());
        request.put("recv_name", payout.getBeneficiaryName());
        request.put("recv_bank_name", payout.getBankName());
        request.put("purpose", payout.getPurpose());
        request.put("recv_acc_no", payout.getAccountNo());
        request.put("signature", signature);

        String response = payoutWebClient.post()
                .uri("/payout/v1/transfer")
                .header("Content-Type", "application/json")
                .header("X-APIKEY", apiKey)
                .header("X-APISECRET", secretKey)
                .bodyValue(request.toString())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return new JSONObject(response);
    }

    /**
     * Check Payout Status
     */
    public JSONObject getPayoutStatus(String payoutRef) {
        String signature = PaynproUtil.generateSignature(secretKey, payoutRef);

        JSONObject request = new JSONObject();
        request.put("payout_ref", payoutRef);
        request.put("signature", signature);

        String response = payoutWebClient.post()
                .uri("/payout/v1/getStatus")
                .header("Content-Type", "application/json")
                .header("X-APIKEY", apiKey)
                .header("X-APISECRET", secretKey)
                .bodyValue(request.toString())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return new JSONObject(response);
    }

    /**
     * Get Transaction Report from PaynPro
     */
    public JSONObject getTxnReport(String startDate, String endDate) {
        JSONObject request = new JSONObject();
        request.put("startDate", startDate);
        request.put("endDate", endDate);

        String response = payoutWebClient.post()
                .uri("/payout/v1/getTxnReport")
                .header("Content-Type", "application/json")
                .header("X-APIKEY", apiKey)
                .header("X-APISECRET", secretKey)
                .bodyValue(request.toString())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return new JSONObject(response);
    }

    /**
     * Get Transaction Statement from PaynPro
     */
    public JSONObject getStatement(String startDate, String endDate) {
        JSONObject request = new JSONObject();
        request.put("startDate", startDate);
        request.put("endDate", endDate);

        String response = payoutWebClient.post()
                .uri("/payout/v1/getStatement")
                .header("Content-Type", "application/json")
                .header("X-APIKEY", apiKey)
                .header("X-APISECRET", secretKey)
                .bodyValue(request.toString())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return new JSONObject(response);
    }

    public JSONObject createOrder(double amount, String tradeNo, String name, String email, String mobile) {
        // 1️⃣ Generate HmacSHA256 signature for internal JSON
        String signature = PaynproUtil.generateSignature(
                secretKey,
                apiKey,
                secretKey,
                "INR",
                String.valueOf(amount),
                name,
                email,
                mobile);

        // 2️⃣ Build JSON for encryption
        JSONObject payload = new JSONObject();
        payload.put("amount", String.valueOf(amount));
        payload.put("tradeNo", tradeNo);
        payload.put("key_id", apiKey);
        payload.put("key_secret", secretKey);
        payload.put("mobile", mobile);
        payload.put("txnCurr", "INR");
        payload.put("email", email);
        payload.put("name", name);
        payload.put("signature", signature);
        payload.put("notifyUrl", "https://indishoppe.in/api/payout/paynpro-payout-webhook-response");
        payload.put("returnUrl", "http://localhost:3000/dashboard");

        // 3️⃣ AES encrypt the payload
        String encryptedData = PaynproUtil.encryptAES(payload.toString(), encryptionKey, saltKey);

        log.info("Initiating Paynpro Encrypted request for tradeNo: {}", tradeNo);

        // 4️⃣ Send request as x-www-form-urlencoded with URL encoding
        try {
            String encodedKey = java.net.URLEncoder.encode(apiKey, "UTF-8");
            String encodedData = java.net.URLEncoder.encode(encryptedData, "UTF-8");

            String response = webClient.post()
                    .uri("/payment/gateway/test/request")
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .bodyValue("key_id=" + encodedKey + "&data=" + encodedData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Paynpro API Response: {}", response);
            return new JSONObject(response);
        } catch (java.io.UnsupportedEncodingException e) {
            log.error("Encoding error: {}", e.getMessage());
            throw new RuntimeException("Payment initiation failed due to encoding error", e);
        }
    }
}
