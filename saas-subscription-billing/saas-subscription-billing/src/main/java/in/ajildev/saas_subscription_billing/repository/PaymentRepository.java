package in.ajildev.saas_subscription_billing.repository;

import in.ajildev.saas_subscription_billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTxnId(String txnId);
}
