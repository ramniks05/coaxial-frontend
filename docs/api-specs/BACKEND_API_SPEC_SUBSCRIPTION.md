# 📋 SUBSCRIPTION MANAGEMENT API SPECIFICATION

**Frontend Implementation**: COMPLETE ✅  
**Backend Implementation**: PENDING ⏳

---

## 🎯 OVERVIEW

This document specifies all backend API endpoints required for the Student Subscription Management system. The frontend is already built and ready - just implement these APIs and we're good to go!

---

## 🔑 AUTHENTICATION

All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

---

## 📡 API ENDPOINTS

### 1. GET /api/student/subscriptions/my-subscriptions

**Description**: Get all subscriptions for the logged-in student with complete details

**Authorization**: Required

**Response**:
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": 1,
      "subscriptionLevel": "CLASS",  
      "entityId": 6,  
      "entityName": "Grade 1",  
      "courseTypeName": "Academic Course",
      "courseName": "Academic Course Class 1-10",
      "planType": "MONTHLY",  
      "amount": 500.00,
      "durationDays": 30,
      "startDate": "2024-01-15T10:30:00",
      "expiryDate": "2024-02-14T23:59:59",
      "isActive": true,
      "status": "ACTIVE",  
      "razorpay_payment_id": "pay_xxxx",
      "razorpay_order_id": "order_xxxx",
      "createdAt": "2024-01-15T10:30:00"
    }
  ]
}
```

**Field Descriptions**:
- `subscriptionLevel`: "CLASS" | "EXAM" | "COURSE"
- `entityId`: ID of the class/exam/course subscribed to
- `entityName`: Name of the subscribed item (e.g., "Grade 1", "SSC MTS")
- `courseTypeName`: Course type name (e.g., "Academic Course")
- `courseName`: Parent course name
- `planType`: "MONTHLY" | "QUARTERLY" | "YEARLY"
- `amount`: Amount paid in rupees
- `durationDays`: Subscription duration in days
- `startDate`: Subscription start timestamp (ISO 8601)
- `expiryDate`: Subscription expiry timestamp (calculated: startDate + durationDays)
- `isActive`: Boolean indicating if subscription is currently active
- `status`: "ACTIVE" | "EXPIRED" | "CANCELLED"
- `razorpay_payment_id`: Razorpay payment ID from successful payment
- `razorpay_order_id`: Razorpay order ID from payment

**IMPORTANT**: Calculate `expiryDate` as `startDate + durationDays`

**Example SQL Query**:
```sql
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
```

---

### 2. GET /api/student/subscriptions/{id}

**Description**: Get details of a specific subscription

**Authorization**: Required

**Path Parameters**:
- `id` (number): Subscription ID

**Response**: Same structure as single subscription object from endpoint #1

**Example**:
```
GET /api/student/subscriptions/123
```

---

### 3. PUT /api/student/subscriptions/{id}/cancel

**Description**: Cancel an active subscription

**Authorization**: Required

**Path Parameters**:
- `id` (number): Subscription ID to cancel

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": {
    ...updated subscription object with status="CANCELLED" and isActive=false...
  }
}
```

**Business Logic**:
```sql
UPDATE subscriptions 
SET is_active = false, 
    status = 'CANCELLED',
    cancelled_at = NOW()
WHERE id = ? AND user_id = ? AND is_active = true
```

---

### 4. GET /api/student/subscriptions/check-access

**Description**: Check if student has access to specific content

**Authorization**: Required

**Query Parameters**:
- `entityType` (string): "CLASS" | "EXAM" | "COURSE"
- `entityId` (number): ID of the entity to check

**Example**:
```
GET /api/student/subscriptions/check-access?entityType=CLASS&entityId=6
```

**Response**:
```json
{
  "hasAccess": true,
  "subscription": {
    ...subscription object...
  },
  "daysRemaining": 15,
  "expiryDate": "2024-02-14T23:59:59"
}
```

**Business Logic**:
```sql
SELECT * FROM subscriptions 
WHERE user_id = ? 
  AND subscription_level = ?
  AND entity_id = ?
  AND is_active = true
  AND NOW() < DATE_ADD(start_date, INTERVAL duration_days DAY)
```

---

### 5. GET /api/student/subscriptions/expiring-soon

**Description**: Get subscriptions expiring in next 7 days

**Authorization**: Required

**Response**:
```json
{
  "success": true,
  "expiringSubscriptions": [
    ...array of subscription objects...
  ],
  "count": 2
}
```

**Business Logic**:
```sql
SELECT * FROM subscriptions 
WHERE user_id = ?
  AND is_active = true
  AND DATEDIFF(DATE_ADD(start_date, INTERVAL duration_days DAY), NOW()) BETWEEN 0 AND 7
ORDER BY start_date ASC
```

---

### 6. POST /api/student/subscriptions/{id}/renew

**Description**: Renew an expired or expiring subscription (creates new Razorpay order)

**Authorization**: Required

**Path Parameters**:
- `id` (number): Subscription ID to renew

**Request Body**:
```json
{
  "planType": "MONTHLY"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_xyz123",
    "entity": "order",
    "amount": 50000,
    "amount_paid": 0,
    "currency": "INR",
    "receipt": "receipt_123",
    "status": "created",
    "notes": "{\"subscription_id\":\"456\",\"renewal\":\"true\"}"
  },
  "keyId": "rzp_test_xxxxx"
}
```

**Business Logic**:
1. Get the original subscription details
2. Create new Razorpay order with renewal flag
3. Store pending subscription renewal record
4. Return order details for frontend to open Razorpay
5. After payment verification, create new subscription with new dates

---

## 🎨 FRONTEND MOCK DATA REFERENCE

The frontend is using this mock data structure. Match this exactly:

```javascript
{
  id: 1,
  subscriptionLevel: "CLASS",
  entityId: 6,
  entityName: "Grade 1",
  courseTypeName: "Academic Course",
  courseName: "Academic Course Class 1-10",
  planType: "MONTHLY",
  amount: 500.00,
  durationDays: 30,
  startDate: "2024-01-15T10:30:00",
  expiryDate: "2024-02-14T23:59:59",
  isActive: true,
  status: "ACTIVE",
  razorpay_payment_id: "pay_123456",
  razorpay_order_id: "order_123456",
  createdAt: "2024-01-15T10:30:00"
}
```

---

## 📊 DATABASE SCHEMA REFERENCE

Suggested subscription table structure:

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
  status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_entity (subscription_level, entity_id),
  INDEX idx_expiry (start_date, duration_days),
  INDEX idx_status (status, is_active),
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## ✅ TESTING CHECKLIST

Once you implement the APIs, test:

1. ✅ Student can view all their subscriptions
2. ✅ Subscription cards show correct status (Active/Expiring/Expired/Cancelled)
3. ✅ Days remaining calculates correctly
4. ✅ Expiring soon banner appears for subscriptions with < 30 days
5. ✅ Cancel subscription works and updates status
6. ✅ Subscription details modal shows all information
7. ✅ Renew creates new Razorpay order
8. ✅ Check access returns correct hasAccess boolean
9. ✅ Stats cards show accurate counts

---

## 🚀 INTEGRATION STEPS

After backend APIs are ready:

1. Update `src/services/subscriptionService.js` 
2. Remove mock data from `StudentSubscription.js`
3. Uncomment real API calls
4. Test end-to-end flow
5. Ship to production! 🎉

---

## 💡 NOTES

- All dates in ISO 8601 format
- **expiryDate must be calculated**: startDate + durationDays
- Mark subscriptions EXPIRED automatically when current date > expiryDate
- Keep all Razorpay transaction details for reference
- Ensure proper indexing for performance

---

## 📞 CONTACT

Frontend is ready! Implement these APIs and ping me for integration testing.

**Frontend Developer**: Ready and waiting! ✅  
**Backend Developer**: Your turn! 🎯

