package in.ajildev.saas_subscription_billing.service;

import in.ajildev.saas_subscription_billing.security.PaynproUtil;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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

    public PaynProService(WebClient.Builder builder, @Value("${paynpro.base.url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    public Mono<String> createPayment(String name, String email, String mobile, String amount) {
        // ... (existing code if needed, but I'll make sure createOrder is there)
        return null;
    }

    /**
     * Standard method used by SubscriptionService
     */
    public JSONObject createOrder(double amount, String tradeNo, String name, String email, String mobile) {
        // 1️⃣ Generate signature
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
        payload.put("tradeNo", tradeNo); // Use tradeNo instead of random payload
        payload.put("key_id", apiKey);
        payload.put("key_secret", secretKey);
        payload.put("mobile", mobile);
        payload.put("txnCurr", "INR");
        payload.put("email", email);
        payload.put("name", name);
        payload.put("signature", signature);

        // 3️⃣ AES encrypt
        String encrypted = PaynproUtil.encryptAES(payload.toString(), encryptionKey, saltKey);

        log.info("Initiating Paynpro encrypted order for tradeNo: {}", tradeNo);

        // 4️⃣ Send request
        String response = webClient.post()
                .uri("/payment/gateway/test/request") // Using the URI from createPayment
                .bodyValue("key_id=" + apiKey + "&data=" + encrypted)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.info("Paynpro API Response: {}", response);
        return new JSONObject(response);
    }

}
