# ⚡ QUICK START - Backend API Implementation

## 🎯 COPY-PASTE THIS TO YOUR BACKEND TEAM

---

## 📋 ENDPOINTS NEEDED (6 Total)

### Base URL: `/api/student/subscriptions`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/my-subscriptions` | Get all student subscriptions |
| GET | `/{id}` | Get single subscription details |
| PUT | `/{id}/cancel` | Cancel a subscription |
| GET | `/check-access?entityType=CLASS&entityId=6` | Check content access |
| GET | `/expiring-soon` | Get subscriptions expiring in 7 days |
| POST | `/{id}/renew` | Renew subscription (creates Razorpay order) |

---

## 🔑 KEY REQUIREMENTS

### 1. Response Structure (MUST MATCH EXACTLY)

```javascript
{
  id: number,
  subscriptionLevel: "CLASS" | "EXAM" | "COURSE",
  entityId: number,
  entityName: string,           // ← MUST JOIN to get name
  courseTypeName: string,        // ← MUST JOIN to get name  
  courseName: string,            // ← MUST JOIN to get name
  planType: "MONTHLY" | "QUARTERLY" | "YEARLY",
  amount: number,
  durationDays: number,
  startDate: string,             // ISO 8601 format
  expiryDate: string,            // ← MUST CALCULATE: startDate + durationDays
  isActive: boolean,
  status: "ACTIVE" | "EXPIRED" | "CANCELLED",
  razorpay_payment_id: string,
  razorpay_order_id: string,
  createdAt: string              // ISO 8601 format
}
```

### 2. Critical Calculations

**Expiry Date** (MUST DO THIS):
```sql
DATE_ADD(start_date, INTERVAL duration_days DAY) as expiryDate
```

**Status** (MUST DO THIS):
```sql
CASE 
  WHEN is_active = false THEN 'CANCELLED'
  WHEN NOW() > DATE_ADD(start_date, INTERVAL duration_days DAY) THEN 'EXPIRED'
  ELSE 'ACTIVE'
END as status
```

---

## 📝 IMPLEMENTATION EXAMPLE

### Endpoint 1: GET /my-subscriptions

```java
@GetMapping("/my-subscriptions")
public ResponseEntity<?> getMySubscriptions(@RequestHeader("Authorization") String token) {
    Long userId = extractUserIdFromToken(token);
    
    // SQL with JOINS to get entity names
    String sql = """
        SELECT 
            s.id,
            s.subscription_level as subscriptionLevel,
            s.entity_id as entityId,
            CASE 
                WHEN s.subscription_level = 'CLASS' THEN c.class_name
                WHEN s.subscription_level = 'EXAM' THEN e.exam_name
                WHEN s.subscription_level = 'COURSE' THEN co.course_name
            END as entityName,
            ct.course_type_name as courseTypeName,
            co.course_name as courseName,
            s.plan_type as planType,
            s.amount,
            s.duration_days as durationDays,
            s.start_date as startDate,
            DATE_ADD(s.start_date, INTERVAL s.duration_days DAY) as expiryDate,
            s.is_active as isActive,
            CASE 
                WHEN s.is_active = false THEN 'CANCELLED'
                WHEN NOW() > DATE_ADD(s.start_date, INTERVAL s.duration_days DAY) THEN 'EXPIRED'
                ELSE 'ACTIVE'
            END as status,
            s.razorpay_payment_id,
            s.razorpay_order_id,
            s.created_at as createdAt
        FROM subscriptions s
        LEFT JOIN classes c ON s.entity_id = c.id AND s.subscription_level = 'CLASS'
        LEFT JOIN exams e ON s.entity_id = e.id AND s.subscription_level = 'EXAM'
        LEFT JOIN courses co ON s.entity_id = co.id AND s.subscription_level = 'COURSE'
        LEFT JOIN course_types ct ON co.course_type_id = ct.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
    """;
    
    List<Subscription> subscriptions = jdbcTemplate.query(sql, new SubscriptionRowMapper(), userId);
    
    return ResponseEntity.ok(Map.of(
        "success", true,
        "subscriptions", subscriptions
    ));
}
```

### Endpoint 2: PUT /{id}/cancel

```java
@PutMapping("/{id}/cancel")
public ResponseEntity<?> cancelSubscription(
    @PathVariable Long id,
    @RequestHeader("Authorization") String token
) {
    Long userId = extractUserIdFromToken(token);
    
    String sql = """
        UPDATE subscriptions 
        SET is_active = false, 
            status = 'CANCELLED',
            cancelled_at = NOW()
        WHERE id = ? AND user_id = ? AND is_active = true
    """;
    
    int updated = jdbcTemplate.update(sql, id, userId);
    
    if (updated == 0) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Subscription not found or already cancelled"
        ));
    }
    
    // Fetch updated subscription
    Subscription subscription = getSubscriptionById(id);
    
    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Subscription cancelled successfully",
        "subscription", subscription
    ));
}
```

### Endpoint 3: GET /check-access

```java
@GetMapping("/check-access")
public ResponseEntity<?> checkAccess(
    @RequestParam String entityType,
    @RequestParam Long entityId,
    @RequestHeader("Authorization") String token
) {
    Long userId = extractUserIdFromToken(token);
    
    String sql = """
        SELECT * FROM subscriptions 
        WHERE user_id = ? 
            AND subscription_level = ?
            AND entity_id = ?
            AND is_active = true
            AND NOW() < DATE_ADD(start_date, INTERVAL duration_days DAY)
    """;
    
    try {
        Subscription sub = jdbcTemplate.queryForObject(sql, 
            new SubscriptionRowMapper(), 
            userId, entityType, entityId
        );
        
        int daysRemaining = calculateDaysRemaining(sub.getExpiryDate());
        
        return ResponseEntity.ok(Map.of(
            "hasAccess", true,
            "subscription", sub,
            "daysRemaining", daysRemaining,
            "expiryDate", sub.getExpiryDate()
        ));
    } catch (EmptyResultDataAccessException e) {
        return ResponseEntity.ok(Map.of(
            "hasAccess", false
        ));
    }
}
```

### Endpoint 4: GET /expiring-soon

```java
@GetMapping("/expiring-soon")
public ResponseEntity<?> getExpiringSoon(@RequestHeader("Authorization") String token) {
    Long userId = extractUserIdFromToken(token);
    
    String sql = """
        SELECT * FROM subscriptions 
        WHERE user_id = ?
            AND is_active = true
            AND DATEDIFF(DATE_ADD(start_date, INTERVAL duration_days DAY), NOW()) BETWEEN 0 AND 7
        ORDER BY start_date ASC
    """;
    
    List<Subscription> expiring = jdbcTemplate.query(sql, new SubscriptionRowMapper(), userId);
    
    return ResponseEntity.ok(Map.of(
        "success", true,
        "expiringSubscriptions", expiring,
        "count", expiring.size()
    ));
}
```

---

## 🗄️ DATABASE TABLE

```sql
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    subscription_level ENUM('CLASS', 'EXAM', 'COURSE') NOT NULL,
    entity_id BIGINT NOT NULL,
    plan_type ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_entity (subscription_level, entity_id),
    INDEX idx_status (status, is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## ✅ TEST WITH THIS DATA

After implementing, test with:

```json
{
  "subscriptionLevel": "CLASS",
  "entityId": 6,
  "planType": "MONTHLY",
  "amount": 500.00,
  "durationDays": 30,
  "startDate": "2024-01-15T10:30:00",
  "razorpay_payment_id": "pay_test123",
  "razorpay_order_id": "order_test123"
}
```

Expected expiryDate: `2024-02-14T23:59:59`

---

## 🎯 PRIORITY ORDER

Implement in this order for fastest integration:

1. **GET /my-subscriptions** ← Start here (most important)
2. **GET /expiring-soon** ← Needed for warnings
3. **PUT /{id}/cancel** ← Easy to implement
4. **GET /check-access** ← For content protection
5. **GET /{id}** ← Similar to #1
6. **POST /{id}/renew** ← Most complex (involves Razorpay)

---

## 🚀 WHEN YOU'RE DONE

1. Test each endpoint with Postman
2. Verify response structure matches EXACTLY
3. Check that expiryDate is calculated correctly
4. Ping frontend developer for integration
5. Ship! 🎉

---

**Questions?** Check `BACKEND_API_SPEC_SUBSCRIPTION.md` for full details!

**Frontend Status**: ✅ 100% Ready and waiting!

