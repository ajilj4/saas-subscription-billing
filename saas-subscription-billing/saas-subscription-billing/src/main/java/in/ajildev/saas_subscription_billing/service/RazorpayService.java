package in.ajildev.saas_subscription_billing.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

@Service
public class RazorpayService {

    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    @Value("${razorpay.account.number}")
    private String accountNumber;

    private RazorpayClient razorpayClient;
    private final org.springframework.web.reactive.function.client.WebClient webClient;

    public RazorpayService(org.springframework.web.reactive.function.client.WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.razorpay.com").build();
    }

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(apiKey, apiSecret);
    }

    /**
     * Initiate a Payout via RazorpayX 3-Step Flow:
     * 1. Create/Identify Contact
     * 2. Create Fund Account
     * 3. Trigger Payout
     */
    public JSONObject initiatePayout(in.ajildev.saas_subscription_billing.entity.Payout payout) {
        String authBase64 = java.util.Base64.getEncoder().encodeToString((apiKey + ":" + apiSecret).getBytes());
        String authHeader = "Basic " + authBase64;

        // 1. Create Contact
        JSONObject contactReq = new JSONObject();
        contactReq.put("name", payout.getUser().getName());
        contactReq.put("email", payout.getUser().getEmail());
        contactReq.put("contact", payout.getMobile() != null ? payout.getMobile() : "9999999999");
        contactReq.put("type", "customer");
        contactReq.put("reference_id", "USER_" + payout.getUser().getId());

        String contactUrl = "https://api.razorpay.com/v1/contacts";
        System.out.println("Razorpay Contact URL: " + contactUrl);

        String contactRes = webClient.post()
                .uri(contactUrl)
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json")
                .bodyValue(contactReq.toString())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                    return clientResponse.bodyToMono(String.class).flatMap(body -> {
                        return reactor.core.publisher.Mono
                                .error(new RuntimeException("Razorpay Contact API Error: " + body));
                    });
                })
                .bodyToMono(String.class)
                .block();

        JSONObject contactJson = new JSONObject(contactRes);
        String contactId = contactJson.getString("id");

        // 2. Create Fund Account
        JSONObject fundAccReq = new JSONObject();
        fundAccReq.put("contact_id", contactId);
        fundAccReq.put("account_type", "bank_account");

        JSONObject bankAccount = new JSONObject();
        bankAccount.put("name", payout.getBeneficiaryName());
        bankAccount.put("ifsc", payout.getIfsc());
        bankAccount.put("account_number", payout.getAccountNo());

        fundAccReq.put("bank_account", bankAccount);

        String fundAccUrl = "https://api.razorpay.com/v1/fund_accounts";
        System.out.println("Razorpay Fund Account URL: " + fundAccUrl);

        String fundAccRes = webClient.post()
                .uri(fundAccUrl)
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json")
                .bodyValue(fundAccReq.toString())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                    return clientResponse.bodyToMono(String.class).flatMap(body -> {
                        return reactor.core.publisher.Mono
                                .error(new RuntimeException("Razorpay Fund Account API Error: " + body));
                    });
                })
                .bodyToMono(String.class)
                .block();

        JSONObject fundAccJson = new JSONObject(fundAccRes);
        String fundAccountId = fundAccJson.getString("id");

        // 3. Trigger Payout
        JSONObject payoutReq = new JSONObject();
        payoutReq.put("account_number", accountNumber);
        payoutReq.put("fund_account_id", fundAccountId);
        payoutReq.put("amount", payout.getAmount().multiply(new BigDecimal("100")).intValue());
        payoutReq.put("currency", "INR");
        payoutReq.put("mode", "IMPS");
        payoutReq.put("purpose", payout.getPurpose());
        payoutReq.put("queue_if_low_balance", true);
        payoutReq.put("reference_id", payout.getPayoutRef());
        payoutReq.put("narration", "Manual Payout");

        String payoutUrl = "https://api.razorpay.com/v1/payouts";
        System.out.println("Razorpay URL: " + payoutUrl);

        String payoutRes = webClient.post()
                .uri(payoutUrl)
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json")
                .header("X-Payout-Idempotency", payout.getPayoutRef())
                .bodyValue(payoutReq.toString())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                    return clientResponse.bodyToMono(String.class).flatMap(body -> {
                        String errorMessage = "Razorpay API Error";
                        try {
                            JSONObject errorJson = new JSONObject(body);
                            if (errorJson.has("error")) {
                                JSONObject innerError = errorJson.getJSONObject("error");
                                errorMessage = innerError.optString("description", errorMessage);
                            }
                        } catch (Exception e) {
                            // fallback to body if parsing fails
                        }
                        return reactor.core.publisher.Mono.error(new RuntimeException(errorMessage));
                    });
                })
                .bodyToMono(String.class)
                .block();

        return new JSONObject(payoutRes);
    }

    public Order createOrder(BigDecimal amount, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1);

        return razorpayClient.orders.create(orderRequest);
    }

    public JSONObject fetchBalance() {
        String auth = java.util.Base64.getEncoder().encodeToString((apiKey + ":" + apiSecret).getBytes());

        String response = webClient.get()
                .uri("/v1/payouts/accounts/" + accountNumber + "/balance")
                .header("Authorization", "Basic " + auth)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                    return clientResponse.bodyToMono(String.class).flatMap(body -> {
                        return reactor.core.publisher.Mono
                                .error(new RuntimeException("Razorpay Balance API Error: " + body));
                    });
                })
                .bodyToMono(String.class)
                .block();

        return new JSONObject(response);
    }

    public boolean verifyWebhookSignature(String payload, String signature, String webhookSecret) {
        try {
            return Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
