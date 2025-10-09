# Question Management, Test Creation & User Performance System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Question Management System](#question-management-system)
3. [Test Creation System](#test-creation-system)
4. [User Performance Tracking](#user-performance-tracking)
5. [Entity Relationships](#entity-relationships)
6. [API Endpoints (Planned)](#api-endpoints-planned)
7. [Database Schema](#database-schema)
8. [Usage Examples](#usage-examples)

---

## Overview

This system provides a comprehensive solution for:
- **Question Management**: Creating, tagging, and organizing questions with exam associations
- **Test Creation**: Building tests from questions with master exam filtering
- **User Performance Tracking**: Complete analytics and history tracking for student test performance

### Key Features
- ✅ Question creation with multiple choice options
- ✅ Exam tagging (historical appearances + suitability)
- ✅ Master exam management
- ✅ Test creation with question filtering
- ✅ Student test session tracking
- ✅ Complete performance analytics
- ✅ Historical data preservation

---

## Question Management System

### Core Entities

#### 1. Question Entity
**Purpose**: Stores individual questions with comprehensive metadata

**Key Fields**:
```java
- id: Long (Primary Key)
- questionText: String (The actual question)
- questionType: String (MCQ, DESCRIPTIVE, etc.)
- difficultyLevel: String (EASY, MEDIUM, HARD)
- marks: Integer (Default marks for this question)
- negativeMarks: Double (Negative marking for wrong answer)
- timeLimitSeconds: Integer (Suggested time limit)
- explanation: String (Answer explanation)
- courseTypeId: Long (1=Academic, 2=Competitive, 3=Professional)
- relationshipId: Long (ID from ClassSubject/ExamSubject/CourseSubject)
- topicId: Long (Reference to Topic)
- moduleId: Long (Reference to Module)
- chapterId: Long (Reference to Chapter)
- subjectId: Long (Reference to Subject)
```

**Relationships**:
- `@OneToMany` → QuestionOption (Multiple choice options)
- `@OneToMany` → QuestionExamHistory (Historical exam appearances)
- `@OneToMany` → QuestionExamSuitability (Exam suitability tags)
- `@ManyToOne` → Chapter (Parent chapter)

#### 2. QuestionOption Entity
**Purpose**: Stores multiple choice options for questions

**Key Fields**:
```java
- id: Long (Primary Key)
- optionText: String (Option text)
- optionLetter: String (A, B, C, D)
- isCorrect: Boolean (Whether this is the correct answer)
- displayOrder: Integer (Order of display)
- question: Question (Parent question)
```

#### 3. MasterExam Entity
**Purpose**: Master list of all exams (JEE, NEET, GATE, etc.)

**Key Fields**:
```java
- id: Long (Primary Key)
- examName: String (e.g., "JEE Main")
- examCode: String (e.g., "JEE-MAIN")
- examType: String (ENTRANCE, BOARD, COMPETITIVE, PROFESSIONAL)
- conductingBody: String (NTA, CBSE, IIT, AIIMS)
- description: String (Exam description)
```

**Relationships**:
- `@OneToMany` → QuestionExamHistory (Questions that appeared in this exam)
- `@OneToMany` → QuestionExamSuitability (Questions suitable for this exam)
- `@OneToMany` → Test (Tests created for this exam)

#### 4. QuestionExamHistory Entity
**Purpose**: Tracks when questions appeared in specific exams

**Key Fields**:
```java
- id: Long (Primary Key)
- question: Question (The question)
- masterExam: MasterExam (The exam)
- appearedYear: Year (Year enum: 2020-2030)
- appearedSession: String (e.g., "JEE Main 2023")
- marksInExam: Integer (Marks this question carried)
- questionNumberInExam: String (e.g., "Q25")
- difficultyInExam: String (Difficulty as it appeared)
- notes: String (Additional notes)
```

#### 5. QuestionExamSuitability Entity
**Purpose**: Tracks which exams questions are suitable for

**Key Fields**:
```java
- id: Long (Primary Key)
- question: Question (The question)
- masterExam: MasterExam (The exam)
- suitabilityLevel: String (HIGH, MEDIUM, LOW)
- notes: String (Suitability notes)
```

### Question Management Workflow

1. **Create Question**
   ```
   Admin creates question → Sets basic details → Adds options → 
   Tags with exam history → Tags with exam suitability → Saves
   ```

2. **Question Tagging**
   ```
   Historical Tagging: "This question appeared in JEE Main 2023, Q25, 4 marks"
   Suitability Tagging: "This question is suitable for JEE Main (HIGH), JEE Advanced (MEDIUM)"
   ```

3. **Question Filtering**
   ```
   Filter by: Course Type → Subject → Topic → Module → Chapter → 
   Exam History → Exam Suitability → Difficulty → Question Type
   ```

---

## Test Creation System

### Core Entities

#### 1. Test Entity
**Purpose**: Main test configuration and management

**Key Fields**:
```java
- id: Long (Primary Key)
- testName: String (Test name)
- description: String (Test description)
- instructions: String (Test instructions)
- timeLimitMinutes: Integer (Total time limit)
- totalMarks: Integer (Total marks available)
- passingMarks: Integer (Marks required to pass)
- negativeMarking: Boolean (Enable negative marking)
- negativeMarkPercentage: Double (Percentage of marks deducted)
- maxAttempts: Integer (How many times student can take)
- isPublished: Boolean (Whether test is live)
- startDate: LocalDateTime (Test start date)
- endDate: LocalDateTime (Test end date)
- masterExam: MasterExam (Associated master exam)
```

**Relationships**:
- `@ManyToOne` → MasterExam (Associated exam type)
- `@OneToMany` → TestQuestion (Questions in this test)
- `@OneToMany` → TestSession (Student sessions)
- `@OneToMany` → TestAttempt (Student attempts)

#### 2. TestQuestion Entity
**Purpose**: Links tests to questions with test-specific settings

**Key Fields**:
```java
- id: Long (Primary Key)
- test: Test (Parent test)
- question: Question (The question)
- questionOrder: Integer (Order in test)
- marks: Integer (Marks for this question in this test)
- negativeMarks: Double (Negative marks for wrong answer)
```

#### 3. TestSession Entity
**Purpose**: Tracks student test sessions

**Key Fields**:
```java
- id: Long (Primary Key)
- test: Test (The test)
- student: User (The student)
- sessionId: String (Unique session identifier)
- status: TestSessionStatus (STARTED, IN_PROGRESS, PAUSED, COMPLETED, etc.)
- startedAt: LocalDateTime (Session start time)
- endedAt: LocalDateTime (Session end time)
- timeRemainingSeconds: Integer (Time remaining)
- ipAddress: String (Student's IP)
- userAgent: String (Browser information)
```

#### 4. TestAttempt Entity
**Purpose**: Individual test attempts by students

**Key Fields**:
```java
- id: Long (Primary Key)
- test: Test (The test)
- student: User (The student)
- attemptNumber: Integer (Attempt number)
- startedAt: LocalDateTime (Attempt start)
- submittedAt: LocalDateTime (Attempt submission)
- timeTakenSeconds: Integer (Time taken)
- totalQuestions: Integer (Total questions)
- answeredQuestions: Integer (Questions answered)
- correctAnswers: Integer (Correct answers)
- wrongAnswers: Integer (Wrong answers)
- totalMarksObtained: Double (Marks obtained)
- totalMarksAvailable: Double (Marks available)
- percentage: Double (Percentage scored)
- isPassed: Boolean (Pass/fail status)
```

#### 5. TestAnswer Entity
**Purpose**: Stores individual student answers

**Key Fields**:
```java
- id: Long (Primary Key)
- testAttempt: TestAttempt (Parent attempt)
- question: Question (The question)
- selectedOptionId: Long (Selected option ID for MCQ)
- answerText: String (Answer text for descriptive)
- isCorrect: Boolean (Whether answer is correct)
- marksObtained: Double (Marks obtained for this answer)
- timeSpentSeconds: Integer (Time spent on this question)
- isFlagged: Boolean (Student flagged for review)
```

### Test Creation Workflow

1. **Test Setup**
   ```
   Admin creates test → Sets basic configuration → Selects master exam → 
   System filters available questions → Admin selects questions → 
   Sets question order and marks → Publishes test
   ```

2. **Question Selection**
   ```
   Master Exam Selection → Filter Questions by:
   - Historical appearances in that exam
   - Suitability for that exam
   - Subject/Topic/Chapter
   - Difficulty level
   - Question type
   ```

3. **Test Configuration**
   ```
   Time limits → Passing marks → Negative marking → 
   Max attempts → Start/End dates → Instructions
   ```

---

## User Performance Tracking

### Core Entities

#### 1. StudentTestHistory Entity
**Purpose**: Complete historical record of student test performance

**Key Fields**:
```java
- id: Long (Primary Key)
- student: User (The student)
- test: Test (The test taken)
- attemptNumber: Integer (Attempt number)
- testName: String (Historical test name)
- startedAt: LocalDateTime (Test start time)
- completedAt: LocalDateTime (Test completion time)
- timeTakenSeconds: Integer (Time taken)
- totalQuestions: Integer (Total questions)
- answeredQuestions: Integer (Questions answered)
- correctAnswers: Integer (Correct answers)
- wrongAnswers: Integer (Wrong answers)
- totalMarksObtained: Double (Marks obtained)
- totalMarksAvailable: Double (Marks available)
- percentage: Double (Percentage scored)
- isPassed: Boolean (Pass/fail status)
- rankInTest: Integer (Student's rank in test)
- totalStudents: Integer (Total students who took test)
```

#### 2. StudentPerformance Entity
**Purpose**: Aggregated performance analytics per student per test

**Key Fields**:
```java
- id: Long (Primary Key)
- student: User (The student)
- test: Test (The test)
- totalAttempts: Integer (Total attempts)
- bestScore: Double (Best score achieved)
- bestPercentage: Double (Best percentage achieved)
- averageScore: Double (Average score)
- averagePercentage: Double (Average percentage)
- totalTimeSpentSeconds: Integer (Total time spent)
- averageTimePerQuestion: Double (Average time per question)
- totalQuestionsAttempted: Integer (Total questions attempted)
- totalCorrectAnswers: Integer (Total correct answers)
- totalWrongAnswers: Integer (Total wrong answers)
- accuracyPercentage: Double (Accuracy percentage)
- improvementTrend: String (IMPROVING, DECLINING, STABLE)
- lastAttemptDate: LocalDateTime (Last attempt date)
```

### Performance Tracking Workflow

1. **Test Attempt Tracking**
   ```
   Student starts test → Session created → Answers recorded → 
   Test submitted → Results calculated → History stored → 
   Performance updated → Analytics generated
   ```

2. **Performance Analytics**
   ```
   Individual Performance:
   - Best scores and percentages
   - Average performance over time
   - Accuracy trends
   - Time analysis
   - Improvement tracking
   
   Comparative Analysis:
   - Rank in each test
   - Performance vs. other students
   - Subject-wise performance
   - Difficulty-wise performance
   ```

3. **Historical Data**
   ```
   Complete test history → Performance trends → 
   Improvement analysis → Comparative rankings
   ```

---

## Entity Relationships

### Question Management Relationships
```
Question (1) ←→ (N) QuestionOption
Question (1) ←→ (N) QuestionExamHistory
Question (1) ←→ (N) QuestionExamSuitability
Question (N) ←→ (1) Chapter
Question (N) ←→ (1) MasterExam (via QuestionExamHistory)
Question (N) ←→ (1) MasterExam (via QuestionExamSuitability)
```

### Test Creation Relationships
```
Test (1) ←→ (N) TestQuestion
Test (1) ←→ (N) TestSession
Test (1) ←→ (N) TestAttempt
Test (N) ←→ (1) MasterExam
TestQuestion (N) ←→ (1) Question
TestSession (N) ←→ (1) User (Student)
TestAttempt (1) ←→ (N) TestAnswer
TestAnswer (N) ←→ (1) Question
```

### Performance Tracking Relationships
```
User (1) ←→ (N) StudentTestHistory
Test (1) ←→ (N) StudentTestHistory
User (1) ←→ (N) StudentPerformance
Test (1) ←→ (N) StudentPerformance
```

---

## Database Schema

### Key Tables
1. **questions** - Main question storage
2. **question_options** - Multiple choice options
3. **master_exams** - Master exam list
4. **question_exam_histories** - Historical exam appearances
5. **question_exam_suitabilities** - Exam suitability tags
6. **tests** - Test configurations
7. **test_questions** - Test-question mappings
8. **test_sessions** - Student test sessions
9. **test_attempts** - Individual test attempts
10. **test_answers** - Student answers
11. **student_test_histories** - Complete test history
12. **student_performances** - Performance analytics

### Key Constraints
- Unique constraints on test-question combinations
- Unique constraints on student-test-attempt combinations
- Unique constraints on question-exam-year combinations
- Foreign key constraints maintaining referential integrity

---

## Usage Examples

### 1. Creating a Question with Exam Tagging
```java
// Create question
Question question = new Question();
question.setQuestionText("What is the derivative of x²?");
question.setQuestionType("MCQ");
question.setDifficultyLevel("MEDIUM");
question.setMarks(4);

// Add options
QuestionOption optionA = new QuestionOption("2x", "A", true);
QuestionOption optionB = new QuestionOption("x", "B", false);
question.getOptions().add(optionA);
question.getOptions().add(optionB);

// Tag with exam history
QuestionExamHistory history = new QuestionExamHistory();
history.setQuestion(question);
history.setMasterExam(jeeMainExam);
history.setAppearedYear(Year.YEAR_2023);
history.setAppearedSession("JEE Main 2023");
history.setMarksInExam(4);
question.getExamHistories().add(history);

// Tag with exam suitability
QuestionExamSuitability suitability = new QuestionExamSuitability();
suitability.setQuestion(question);
suitability.setMasterExam(jeeMainExam);
suitability.setSuitabilityLevel("HIGH");
question.getExamSuitabilities().add(suitability);
```

### 2. Creating a Test
```java
// Create test
Test test = new Test();
test.setTestName("JEE Main Practice Test");
test.setDescription("Practice test for JEE Main preparation");
test.setTimeLimitMinutes(180);
test.setTotalMarks(300);
test.setPassingMarks(120);
test.setNegativeMarking(true);
test.setMasterExam(jeeMainExam); // Links to JEE Main

// Add questions (filtered by master exam)
TestQuestion testQuestion1 = new TestQuestion();
testQuestion1.setTest(test);
testQuestion1.setQuestion(question1); // Question tagged with JEE Main
testQuestion1.setQuestionOrder(1);
testQuestion1.setMarks(4);
test.getTestQuestions().add(testQuestion1);
```

### 3. Student Taking Test
```java
// Start test session
TestSession session = new TestSession();
session.setTest(test);
session.setStudent(student);
session.setSessionId(UUID.randomUUID().toString());
session.setStatus(TestSessionStatus.STARTED);

// Create test attempt
TestAttempt attempt = new TestAttempt();
attempt.setTest(test);
attempt.setStudent(student);
attempt.setAttemptNumber(1);
attempt.setStartedAt(LocalDateTime.now());

// Record answers
TestAnswer answer = new TestAnswer();
answer.setTestAttempt(attempt);
answer.setQuestion(question1);
answer.setSelectedOptionId(optionA.getId());
answer.setIsCorrect(true);
answer.setMarksObtained(4.0);
answer.markAsAnswered();
```

### 4. Performance Tracking
```java
// Update student performance
StudentPerformance performance = studentPerformanceRepository
    .findByStudentIdAndTestId(student.getId(), test.getId());
    
performance.updatePerformance(
    attempt.getTotalMarksObtained(),
    attempt.getPercentage(),
    attempt.getTimeTakenSeconds(),
    attempt.getCorrectAnswers(),
    attempt.getWrongAnswers()
);

// Create historical record
StudentTestHistory history = new StudentTestHistory();
history.setStudent(student);
history.setTest(test);
history.setAttemptNumber(attempt.getAttemptNumber());
history.setTestName(test.getTestName());
history.setStartedAt(attempt.getStartedAt());
history.setCompletedAt(attempt.getSubmittedAt());
history.setTotalMarksObtained(attempt.getTotalMarksObtained());
history.setPercentage(attempt.getPercentage());
history.setIsPassed(attempt.getIsPassed());
```

---

## Benefits of This System

### For Administrators
- ✅ **Organized Question Management**: Questions are properly categorized and tagged
- ✅ **Flexible Test Creation**: Create tests based on specific exam types
- ✅ **Quality Control**: Only relevant questions available for each test type
- ✅ **Performance Analytics**: Comprehensive student performance tracking

### For Students
- ✅ **Authentic Practice**: Tests based on real exam patterns
- ✅ **Performance Tracking**: Detailed analytics and improvement tracking
- ✅ **Historical Context**: See how questions appeared in actual exams
- ✅ **Retake Capability**: Multiple attempts with performance comparison

### For System
- ✅ **Scalable Architecture**: Handles large numbers of questions and tests
- ✅ **Data Integrity**: Comprehensive constraints and relationships
- ✅ **Audit Trail**: Complete tracking of all activities
- ✅ **Analytics Ready**: Rich data for performance analysis

---

This documentation provides a comprehensive overview of the Question Management, Test Creation, and User Performance tracking system. The system is designed to be flexible, scalable, and provide rich analytics for educational institutions.
