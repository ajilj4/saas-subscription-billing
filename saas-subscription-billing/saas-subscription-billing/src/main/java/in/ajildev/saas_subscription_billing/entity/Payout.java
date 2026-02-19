package in.ajildev.saas_subscription_billing.entity;

import in.ajildev.saas_subscription_billing.enums.PaymentGateway;
import in.ajildev.saas_subscription_billing.enums.PayoutStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payouts")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(nullable = false)
    private BigDecimal amount;

    private String txnId; // Gateway internal ID

    @Column(nullable = false, unique = true)
    private String payoutRef; // Our internal reference

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayoutStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentGateway gateway;

    // Beneficiary Details Snapshot
    private String beneficiaryName;
    private String accountNo;
    private String ifsc;
    private String bankName;
    private String purpose;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private String responseJson; // Raw gateway response
}
