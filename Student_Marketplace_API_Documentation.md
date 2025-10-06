# Student Marketplace API Documentation

## Overview
This document outlines the backend API endpoints required for the Student Course Marketplace functionality, including course catalog browsing, subscription management, and Razorpay payment integration.

## Base URL
```
http://localhost:8080/api/student
```

## Authentication
All endpoints require Bearer token authentication in the header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Course Catalog APIs

### 1.1 Get Course Catalog
**Endpoint:** `GET /api/student/courses/catalog`

**Description:** Retrieve complete course catalog with all course types, courses, classes/exams, and content statistics.

**Query Parameters:**
- `active` (boolean, optional): Filter only active courses (default: true)
- `courseTypeId` (integer, optional): Filter by specific course type
- `search` (string, optional): Search in course names and descriptions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Academic Course",
      "description": "Complete school curriculum courses for grades 1-12",
      "icon": "🎓",
      "courses": [
        {
          "id": 1,
          "name": "Academic Course Class 1-10",
          "description": "Complete academic curriculum for primary and secondary education",
          "classes": [
            {
              "id": 6,
              "name": "Grade 1",
              "description": "Foundation learning for young students",
              "subjectCount": 3,
              "topicCount": 45,
              "moduleCount": 135,
              "chapterCount": 360,
              "questionCount": 1500,
              "duration": "1 academic year",
              "difficulty": "Beginner",
              "pricing": {
                "monthly": 299,
                "quarterly": 799,
                "yearly": 2499
              },
              "subjects": [
                {
                  "id": 1,
                  "name": "Mathematics",
                  "topicCount": 15,
                  "moduleCount": 45,
                  "chapterCount": 120,
                  "questionCount": 500
                }
              ]
            }
          ],
          "exams": null
        }
      ]
    }
  ],
  "message": "Course catalog retrieved successfully"
}
```

### 1.2 Get Course Type Details
**Endpoint:** `GET /api/student/courses/{courseTypeId}/details`

**Description:** Get detailed information about a specific course type.

**Path Parameters:**
- `courseTypeId` (integer, required): Course type ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Academic Course",
    "description": "Complete school curriculum courses",
    "totalCourses": 2,
    "totalClasses": 3,
    "totalSubjects": 12,
    "totalQuestions": 7000
  }
}
```

### 1.3 Get Classes by Course
**Endpoint:** `GET /api/student/courses/{courseId}/classes`

**Description:** Get all classes available in a specific course.

**Path Parameters:**
- `courseId` (integer, required): Course ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "name": "Grade 1",
      "description": "Foundation learning",
      "subjectCount": 3,
      "pricing": {
        "monthly": 299,
        "quarterly": 799,
        "yearly": 2499
      }
    }
  ]
}
```

### 1.4 Get Exams by Course
**Endpoint:** `GET /api/student/courses/{courseId}/exams`

**Description:** Get all exams available in a specific course.

**Path Parameters:**
- `courseId` (integer, required): Course ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SSC MTS",
      "description": "Multi-Tasking Staff examination",
      "subjectCount": 4,
      "pricing": {
        "monthly": 499,
        "quarterly": 1299,
        "yearly": 3999
      }
    }
  ]
}
```

---

## 2. Subscription Management APIs

### 2.1 Get Student Subscriptions
**Endpoint:** `GET /api/student/subscriptions`

**Description:** Get all active subscriptions for the current student.

**Query Parameters:**
- `active` (boolean, optional): Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "courseTypeId": 1,
      "courseId": 1,
      "classId": 6,
      "examId": null,
      "subscriptionType": "class",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "courseTypeName": "Academic Course",
      "courseName": "Academic Course Class 1-10",
      "className": "Grade 1"
    }
  ]
}
```

### 2.2 Create Subscription
**Endpoint:** `POST /api/student/subscriptions`

**Description:** Create a new subscription for a course/class/exam.

**Request Body:**
```json
{
  "courseTypeId": 1,
  "courseId": 1,
  "classId": 6,
  "examId": null,
  "subscriptionType": "class",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "subscriptionType": "class",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "isActive": true
  },
  "message": "Subscription created successfully"
}
```

### 2.3 Delete Subscription
**Endpoint:** `DELETE /api/student/subscriptions/{subscriptionId}`

**Description:** Delete a subscription.

**Path Parameters:**
- `subscriptionId` (integer, required): Subscription ID

**Response:**
```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

---

## 3. Payment Gateway APIs (Razorpay Integration)

### 3.1 Create Payment Order
**Endpoint:** `POST /api/student/subscription/create-payment`

**Description:** Create a Razorpay order for subscription payment.

**Request Body:**
```json
{
  "courseId": 1,
  "classId": 6,
  "examId": null,
  "subscriptionType": "class",
  "pricingType": "yearly",
  "amount": 2499,
  "duration": 365
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_1234567890",
    "amount": 249900,
    "currency": "INR",
    "key": "rzp_test_YOUR_KEY",
    "subscriptionData": {
      "courseId": 1,
      "classId": 6,
      "subscriptionType": "class",
      "pricingType": "yearly"
    }
  }
}
```

### 3.2 Verify Payment
**Endpoint:** `POST /api/student/subscription/verify-payment`

**Description:** Verify Razorpay payment and create subscription.

**Request Body:**
```json
{
  "paymentId": "pay_1234567890",
  "orderId": "order_1234567890",
  "signature": "signature_hash",
  "courseId": 1,
  "classId": 6,
  "examId": null,
  "subscriptionType": "class",
  "pricingType": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": 1,
    "paymentId": "pay_1234567890",
    "orderId": "order_1234567890",
    "amount": 2499,
    "status": "completed",
    "subscription": {
      "id": 1,
      "subscriptionType": "class",
      "startDate": "2024-01-01",
      "endDate": "2025-01-01"
    }
  },
  "message": "Payment verified and subscription created successfully"
}
```

### 3.3 Get Pricing Information
**Endpoint:** `GET /api/student/subscription/pricing`

**Description:** Get pricing information for different subscription types.

**Query Parameters:**
- `courseTypeId` (integer, optional): Filter by course type
- `courseId` (integer, optional): Filter by course
- `classId` (integer, optional): Filter by class
- `examId` (integer, optional): Filter by exam

**Response:**
```json
{
  "success": true,
  "data": {
    "pricingTiers": [
      {
        "type": "monthly",
        "name": "Monthly",
        "discount": 0,
        "description": "Perfect for trying out"
      },
      {
        "type": "quarterly",
        "name": "Quarterly",
        "discount": 10,
        "description": "Great value for committed learners"
      },
      {
        "type": "yearly",
        "name": "Yearly",
        "discount": 20,
        "description": "Best value for serious students"
      }
    ],
    "defaultPricing": {
      "monthly": 299,
      "quarterly": 799,
      "yearly": 2499
    }
  }
}
```

---

## 4. Content Access APIs

### 4.1 Get Accessible Content
**Endpoint:** `GET /api/student/content/{subscriptionId}`

**Description:** Get content accessible to the student based on their subscription.

**Path Parameters:**
- `subscriptionId` (integer, required): Subscription ID

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": 1,
      "subscriptionType": "class",
      "courseTypeName": "Academic Course",
      "courseName": "Academic Course Class 1-10",
      "className": "Grade 1"
    },
    "subjects": [
      {
        "id": 1,
        "name": "Mathematics",
        "linkageId": 5,
        "topicCount": 15,
        "moduleCount": 45,
        "chapterCount": 120,
        "questionCount": 500
      }
    ],
    "totalContent": {
      "subjects": 3,
      "topics": 45,
      "modules": 135,
      "chapters": 360,
      "questions": 1500
    }
  }
}
```

### 4.2 Get Available Tests
**Endpoint:** `GET /api/student/tests/available`

**Description:** Get tests available to the student based on their subscriptions.

**Query Parameters:**
- `subscriptionId` (integer, optional): Filter by specific subscription

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mathematics Chapter 1 Test",
      "description": "Test for Chapter 1 of Mathematics",
      "duration": 60,
      "questionCount": 20,
      "maxAttempts": 3,
      "subjectName": "Mathematics",
      "chapterName": "Basic Operations"
    }
  ]
}
```

### 4.3 Get Accessible Questions
**Endpoint:** `GET /api/student/questions/accessible`

**Description:** Get questions accessible to the student for practice.

**Query Parameters:**
- `subscriptionId` (integer, optional): Filter by specific subscription
- `subjectId` (integer, optional): Filter by subject
- `topicId` (integer, optional): Filter by topic
- `difficulty` (string, optional): Filter by difficulty (EASY, MEDIUM, HARD)
- `questionType` (string, optional): Filter by question type
- `search` (string, optional): Search in question text

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "questionText": "What is 2 + 2?",
      "questionType": "MULTIPLE_CHOICE",
      "difficulty": "EASY",
      "subjectId": 1,
      "subjectName": "Mathematics",
      "topicId": 1,
      "topicName": "Basic Addition",
      "moduleId": 1,
      "moduleName": "Number Operations",
      "chapterId": 1,
      "chapterName": "Introduction to Numbers",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": "4"
    }
  ]
}
```

---

## 5. Progress Tracking APIs

### 5.1 Get Student Progress
**Endpoint:** `GET /api/student/progress`

**Description:** Get learning progress for the student.

**Query Parameters:**
- `subscriptionId` (integer, optional): Filter by specific subscription
- `timeRange` (string, optional): Time range (7, 30, 90, 365, all)

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "chaptersCompleted": 25,
      "totalChapters": 360,
      "questionsAttempted": 150,
      "correctAnswers": 120,
      "timeSpent": 7200
    },
    "subjects": [
      {
        "id": 1,
        "name": "Mathematics",
        "chaptersCompleted": 10,
        "totalChapters": 120,
        "questionsAttempted": 80,
        "accuracy": 85,
        "progressPercentage": 8
      }
    ],
    "topics": [
      {
        "id": 1,
        "name": "Basic Addition",
        "subjectName": "Mathematics",
        "chaptersCompleted": 5,
        "totalChapters": 15,
        "accuracy": 90,
        "progressPercentage": 33
      }
    ]
  }
}
```

### 5.2 Get Test Performance
**Endpoint:** `GET /api/student/test-performance`

**Description:** Get test performance history for the student.

**Query Parameters:**
- `subscriptionId` (integer, optional): Filter by specific subscription
- `timeRange` (string, optional): Time range filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "testId": 1,
      "testName": "Mathematics Chapter 1 Test",
      "score": 85,
      "totalQuestions": 20,
      "correctAnswers": 17,
      "timeSpent": 1800,
      "attemptedAt": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T11:00:00.000Z",
      "isCompleted": true
    }
  ]
}
```

### 5.3 Get Question Statistics
**Endpoint:** `GET /api/student/question-stats`

**Description:** Get question practice statistics for the student.

**Query Parameters:**
- `subscriptionId` (integer, optional): Filter by specific subscription
- `timeRange` (string, optional): Time range filter

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAttempted": 150,
    "correctAnswers": 120,
    "accuracy": 80,
    "timeSpent": 7200,
    "currentStreak": 5,
    "longestStreak": 15,
    "totalStudyTime": 18000
  }
}
```

---

## 6. Question Management APIs

### 6.1 Submit Question Answer
**Endpoint:** `POST /api/student/questions/submit-answer`

**Description:** Submit answer for a practice question.

**Request Body:**
```json
{
  "questionId": 1,
  "userAnswer": "4",
  "isCorrect": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questionId": 1,
    "userAnswer": "4",
    "isCorrect": true,
    "correctAnswer": "4",
    "explanation": "2 + 2 equals 4"
  }
}
```

### 6.2 Bookmark Question
**Endpoint:** `POST /api/student/questions/bookmark`

**Description:** Bookmark or unbookmark a question.

**Request Body:**
```json
{
  "questionId": 1,
  "isBookmarked": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questionId": 1,
    "isBookmarked": true
  }
}
```

### 6.3 Get Question Progress
**Endpoint:** `GET /api/student/question-progress`

**Description:** Get question practice progress for the student.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "questionId": 1,
      "attempts": 3,
      "isCorrect": true,
      "isBookmarked": false,
      "lastAttempted": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 7. Test Management APIs

### 7.1 Get Test Questions
**Endpoint:** `GET /api/student/tests/{testId}/questions`

**Description:** Get questions for a specific test.

**Path Parameters:**
- `testId` (integer, required): Test ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "questionText": "What is 2 + 2?",
      "questionType": "MULTIPLE_CHOICE",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": "4",
      "explanation": "Basic addition"
    }
  ]
}
```

### 7.2 Submit Test
**Endpoint:** `POST /api/student/tests/submit`

**Description:** Submit test answers.

**Request Body:**
```json
{
  "testId": 1,
  "answers": {
    "1": "4",
    "2": "true",
    "3": "Paris"
  },
  "timeSpent": 1800,
  "submittedAt": "2024-01-15T11:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "testAttemptId": 1,
    "testId": 1,
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "timeSpent": 1800,
    "submittedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## 8. Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Invalid or missing authentication token
- `FORBIDDEN`: User doesn't have permission to access resource
- `NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Request validation failed
- `PAYMENT_FAILED`: Payment processing failed
- `SUBSCRIPTION_EXPIRED`: Subscription has expired
- `CONTENT_NOT_ACCESSIBLE`: Student doesn't have access to requested content

---

## 9. Database Schema Requirements

### Required Tables:

#### student_subscriptions
```sql
CREATE TABLE student_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_type_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    class_id BIGINT NULL,
    exam_id BIGINT NULL,
    subscription_type ENUM('course', 'class', 'exam') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_type_id) REFERENCES course_types(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

#### student_payments
```sql
CREATE TABLE student_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    subscription_id BIGINT NOT NULL,
    razorpay_payment_id VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (subscription_id) REFERENCES student_subscriptions(id)
);
```

#### student_test_attempts
```sql
CREATE TABLE student_test_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    score INT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NULL,
    time_spent INT NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id)
);
```

#### student_question_progress
```sql
CREATE TABLE student_question_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    attempts INT DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    last_attempted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE KEY unique_student_question (student_id, question_id)
);
```

---

## 10. Implementation Notes

### Razorpay Integration:
1. Set up Razorpay account and get API keys
2. Install Razorpay SDK in backend
3. Implement webhook handling for payment verification
4. Store payment details securely

### Security Considerations:
1. Validate all payment data server-side
2. Implement rate limiting for payment endpoints
3. Use HTTPS for all payment-related communications
4. Store sensitive data encrypted

### Performance Optimization:
1. Implement caching for course catalog data
2. Use pagination for large data sets
3. Optimize database queries with proper indexing
4. Implement CDN for static content

### Monitoring and Logging:
1. Log all payment transactions
2. Monitor API response times
3. Track subscription metrics
4. Implement alerting for failed payments

---

This documentation provides a comprehensive guide for implementing the backend APIs required for the Student Course Marketplace functionality. Each endpoint includes detailed request/response examples and the necessary database schema requirements.
