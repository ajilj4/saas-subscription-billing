package in.ajildev.saas_subscription_billing.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class PaynproConfig {

    @Value("${paynpro.base.url}")
    private String baseUrl;


    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient paynproWebClient(WebClient.Builder builder) {
        return builder.baseUrl(baseUrl).build();
    }
}
