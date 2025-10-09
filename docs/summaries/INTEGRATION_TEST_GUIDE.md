# 🧪 Integration Test Guide - Subscription Management

## ✅ Backend APIs Connected!

The frontend has been updated to connect to your backend APIs. Here's how to test:

---

## 🔍 **Testing Checklist**

### 1. **View Subscriptions**

**Steps**:
1. Login as a student who has subscriptions
2. Navigate to "Subscriptions" tab in Student Dashboard
3. Check browser console for logs

**Expected Console Logs**:
```
📥 Loading subscriptions from API...
📥 Subscriptions loaded: [...]
📥 Loading expiring subscriptions from API...
📥 Expiring subscriptions loaded: [...]
```

**Expected UI**:
- ✅ Stats cards show correct counts (Total, Active, Expiring, Spent)
- ✅ Subscription cards display with all details
- ✅ Status badges show correct colors (Active=green, Expiring=yellow, Expired=red, Cancelled=gray)
- ✅ Days remaining shows correct number

**If you see errors**: Check console for API response format

---

### 2. **Filter Subscriptions**

**Steps**:
1. Click on different filter tabs (All/Active/Expired/Cancelled)
2. Verify subscriptions filter correctly

**Expected**:
- ✅ "All" shows all subscriptions
- ✅ "Active" shows only active subscriptions
- ✅ "Expired" shows expired subscriptions
- ✅ "Cancelled" shows cancelled subscriptions

---

### 3. **View Subscription Details**

**Steps**:
1. Click "View Details" on any active subscription
2. Modal should open with full details

**Expected**:
- ✅ Modal shows entity name, course info
- ✅ All fields populated (dates, payment IDs, amount)
- ✅ Status badge displays correctly
- ✅ Cancel button visible for active subscriptions

---

### 4. **Cancel Subscription**

**Steps**:
1. Open subscription details modal
2. Click "Cancel Subscription"
3. Confirm the action

**Expected Console Logs**:
```
🚫 Cancelling subscription: 1
🚫 Cancel response: {message: "..."}
📥 Loading subscriptions from API...
```

**Expected UI**:
- ✅ Success notification appears
- ✅ Subscription list reloads
- ✅ Cancelled subscription shows "Cancelled" badge
- ✅ Modal closes

**If fails**: Check backend response format and error message

---

### 5. **Renew Subscription**

**Steps**:
1. Click "Renew Now" on an expiring/expired subscription
2. Select plan type (Monthly/Quarterly/Yearly)
3. Click "Proceed to Payment"
4. Complete Razorpay payment

**Expected Console Logs**:
```
🔄 Renewing subscription: 1 Plan: MONTHLY
🔄 Renewal order created: {order: {...}, keyId: "..."}
✅ Renewal payment successful, verifying...
✅ Renewal verified: {success: true}
📥 Loading subscriptions from API...
```

**Expected UI**:
- ✅ Renewal modal opens with plan options
- ✅ Razorpay modal opens for payment
- ✅ After payment: Success notification appears
- ✅ Subscription list reloads with new subscription
- ✅ Modals close

**If fails**: Check backend renewal endpoint and Razorpay order creation

---

### 6. **Expiring Soon Banner**

**Steps**:
1. Create a subscription expiring in < 7 days (for testing)
2. Reload the subscriptions page

**Expected**:
- ✅ Yellow banner appears at top
- ✅ Shows count of expiring subscriptions
- ✅ "View Details" link filters to expiring

---

## 🐛 **Common Issues & Solutions**

### Issue 1: "Failed to load subscriptions"
**Check**:
- Is backend API running on `http://localhost:8080`?
- Does `/api/student/subscriptions/my-subscriptions` endpoint exist?
- Is student authenticated (token valid)?

**Console**: Look for network errors or 401/403 responses

---

### Issue 2: Subscriptions not displaying
**Check**:
- Console logs: What data is returned from backend?
- Does backend return array directly or wrapped in object?
- Are field names exactly matching (camelCase vs snake_case)?

**Fix**: Verify response format matches:
```json
[
  {
    "id": 1,
    "planType": "MONTHLY",  // Must be uppercase
    "remainingDays": 23,
    "expiryDate": "2025-02-01T00:00:00",
    ...
  }
]
```

---

### Issue 3: Days remaining shows wrong number
**Check**:
- Does backend return `remainingDays` field?
- Is it calculated correctly (expiryDate - currentDate)?

**Frontend**: Will use backend's `remainingDays` if available, otherwise calculates from `expiryDate`

---

### Issue 4: Cancel doesn't work
**Check**:
- Does backend return `{message: "..."}` on success?
- Is subscription ownership verified (student can only cancel their own)?
- Check console for error details

---

### Issue 5: Renewal fails
**Check**:
- Does `/renew` endpoint return Razorpay order object?
- Does order.notes contain `subscription_id`?
- Is Razorpay key configured correctly?

**Response should be**:
```json
{
  "order": {
    "id": "order_xxx",
    "amount": 50000,
    "notes": "{\"subscription_id\":\"123\"}"
  },
  "keyId": "rzp_test_xxx"
}
```

---

## 📊 **Field Mapping Reference**

| Frontend Field | Backend Field | Type | Notes |
|---------------|---------------|------|-------|
| id | id | number | Primary key |
| subscriptionLevel | subscriptionLevel | string | CLASS/EXAM/COURSE |
| entityId | entityId | number | ID of subscribed item |
| entityName | entityName | string | Display name |
| courseTypeName | courseTypeName | string | Via JOIN |
| courseName | courseName | string | Via JOIN |
| planType | planType | string | MONTHLY/QUARTERLY/YEARLY |
| amount | amount | number | In rupees |
| durationDays | durationDays | number | Subscription duration |
| startDate | startDate | string | ISO 8601 |
| expiryDate | expiryDate | string | ISO 8601 (calculated) |
| remainingDays | remainingDays | number | Backend calculates |
| isActive | isActive | boolean | Active flag |
| status | status | string | ACTIVE/EXPIRED/CANCELLED |
| razorpay_payment_id | razorpay_payment_id | string | Snake case |
| razorpay_order_id | razorpay_order_id | string | Snake case |

---

## 🎯 **Success Criteria**

All these should work:

- ✅ Subscriptions load and display correctly
- ✅ Stats cards show accurate numbers
- ✅ Filtering works for all status types
- ✅ Details modal opens with full information
- ✅ Cancel subscription updates status
- ✅ Renewal creates Razorpay order and processes payment
- ✅ Expiring banner shows for subscriptions < 30 days
- ✅ No console errors
- ✅ User stays logged in throughout
- ✅ All notifications appear correctly

---

## 🚀 **Ready to Test!**

1. Start your backend server
2. Login as a student
3. Go to Subscriptions tab
4. Check console logs
5. Test each feature

**Report any issues and I'll fix them immediately!** 🔧

---

## 📝 **Notes**

- Frontend is flexible: works with array response OR wrapped object
- Uses backend's `remainingDays` when available
- Falls back to calculation if `remainingDays` is missing
- All error messages now show details from backend
- Comprehensive console logging for debugging

**The integration is complete and ready for testing!** 🎉

