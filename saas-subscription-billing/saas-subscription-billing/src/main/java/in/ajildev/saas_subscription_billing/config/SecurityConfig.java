package in.ajildev.saas_subscription_billing.config;

import in.ajildev.saas_subscription_billing.security.JwtAuthFilter;
import in.ajildev.saas_subscription_billing.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // ─── Public endpoints (no JWT required) ─────────────────────────────────────
    private static final String[] PUBLIC_URLS = {
            "/api/auth/**", // signup, login
            "/api/plans", // anyone can view plans
            "/api/webhook/**" // payment gateway webhooks (verified by signature)
    };

    // ─── Security Filter Chain ───────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Disable CSRF — not needed for stateless REST APIs
                .csrf(AbstractHttpConfigurer::disable)

                // CORS — allow React frontend (localhost:5173)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Route-level authorization
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_URLS).permitAll()
                        .anyRequest().authenticated())

                // Stateless session — no server-side sessions, JWT only
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Exception handling — return JSON for 401 and 403
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(401);
                            response.getWriter()
                                    .write("{\"status\": 401, \"message\": \"Unauthorized: "
                                            + authException.getMessage() + "\", \"timestamp\": \""
                                            + java.time.LocalDateTime.now() + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(403);
                            response.getWriter()
                                    .write("{\"status\": 403, \"message\": \"Access Denied: "
                                            + accessDeniedException.getMessage() + "\", \"timestamp\": \""
                                            + java.time.LocalDateTime.now() + "\"}");
                        }))

                // Register JWT filter BEFORE Spring's default username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    // ─── Authentication Provider ─────────────────────────────────────────────────

    // ─── Authentication Manager ──────────────────────────────────────────────────

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ─── Password Encoder ────────────────────────────────────────────────────────

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ─── CORS Configuration ──────────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173", // Vite dev server
                "http://localhost:3000", // alternative dev port
                "https://subscription.ajildev.in"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
