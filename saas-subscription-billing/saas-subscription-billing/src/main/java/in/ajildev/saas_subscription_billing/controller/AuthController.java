package in.ajildev.saas_subscription_billing.controller;

import in.ajildev.saas_subscription_billing.dto.AuthRequest;
import in.ajildev.saas_subscription_billing.dto.AuthResponse;
import in.ajildev.saas_subscription_billing.dto.SignupRequest;
import in.ajildev.saas_subscription_billing.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;



    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
