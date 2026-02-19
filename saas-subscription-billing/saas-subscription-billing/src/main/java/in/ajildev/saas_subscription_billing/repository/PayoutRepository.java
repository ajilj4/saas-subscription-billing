package in.ajildev.saas_subscription_billing.repository;

import in.ajildev.saas_subscription_billing.entity.Payout;
import in.ajildev.saas_subscription_billing.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {
    List<Payout> findByUserOrderByCreatedAtDesc(User user);

    Optional<Payout> findByPayoutRef(String payoutRef);

    Optional<Payout> findByTxnId(String txnId);
}
