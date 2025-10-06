# Subject Management API Implementation Guide

## Overview
This guide provides a complete implementation for Subject Management API in Spring Boot, with predefined subject enums based on course types (Academic, Competitive, Professional) and conditional form fields based on the course structure.

## Database Schema

### Subjects Table
```sql
CREATE TABLE subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subject_type ENUM('ACADEMIC', 'COMPETITIVE', 'PROFESSIONAL') NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_name (name),
    INDEX idx_subject_type (subject_type),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
);
```

### Class-Subject Junction Table (for Academic courses)
```sql
CREATE TABLE class_subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    is_compulsory BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class_subject (class_id, subject_id),
    INDEX idx_class_id (class_id),
    INDEX idx_subject_id (subject_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
```

### Exam-Subject Junction Table (for Competitive courses)
```sql
CREATE TABLE exam_subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    weightage DECIMAL(5,2) DEFAULT 100.00,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_exam_subject (exam_id, subject_id),
    INDEX idx_exam_id (exam_id),
    INDEX idx_subject_id (subject_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
```

### Course-Subject Junction Table (for Professional courses)
```sql
CREATE TABLE course_subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    is_compulsory BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_subject (course_id, subject_id),
    INDEX idx_course_id (course_id),
    INDEX idx_subject_id (subject_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
```

## Enums for Predefined Subjects

### Academic Subject Enum
```java
package com.coaxialacademy.entity;

public enum AcademicSubject {
    // Core Subjects
    MATHEMATICS("Mathematics", "Core mathematical concepts and problem solving"),
    PHYSICS("Physics", "Physical sciences and natural phenomena"),
    CHEMISTRY("Chemistry", "Chemical sciences and molecular studies"),
    BIOLOGY("Biology", "Life sciences and biological processes"),
    ENGLISH("English", "Language arts and literature"),
    HINDI("Hindi", "Hindi language and literature"),
    
    // Social Sciences
    HISTORY("History", "Historical events and civilizations"),
    GEOGRAPHY("Geography", "Physical and human geography"),
    CIVICS("Civics", "Political science and governance"),
    ECONOMICS("Economics", "Economic principles and systems"),
    
    // Languages
    SANSKRIT("Sanskrit", "Classical Sanskrit language"),
    FRENCH("French", "French language and culture"),
    GERMAN("German", "German language and culture"),
    SPANISH("Spanish", "Spanish language and culture"),
    
    // Computer Science
    COMPUTER_SCIENCE("Computer Science", "Programming and computer fundamentals"),
    INFORMATION_TECHNOLOGY("Information Technology", "IT concepts and applications"),
    
    // Arts and Creative
    ART("Art", "Visual arts and creativity"),
    MUSIC("Music", "Musical theory and practice"),
    PHYSICAL_EDUCATION("Physical Education", "Sports and physical fitness"),
    
    // Commerce
    ACCOUNTANCY("Accountancy", "Financial accounting and bookkeeping"),
    BUSINESS_STUDIES("Business Studies", "Business principles and management"),
    
    // Other
    ENVIRONMENTAL_SCIENCE("Environmental Science", "Environmental studies and conservation"),
    PSYCHOLOGY("Psychology", "Human behavior and mental processes"),
    SOCIOLOGY("Sociology", "Social behavior and society");
    
    private final String displayName;
    private final String description;
    
    AcademicSubject(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
```

### Competitive Subject Enum
```java
package com.coaxialacademy.entity;

public enum CompetitiveSubject {
    // Engineering Entrance
    MATHEMATICS("Mathematics", "Advanced mathematics for engineering"),
    PHYSICS("Physics", "Physics for engineering entrance"),
    CHEMISTRY("Chemistry", "Chemistry for engineering entrance"),
    
    // Medical Entrance
    BIOLOGY("Biology", "Biology for medical entrance"),
    PHYSICS_MEDICAL("Physics (Medical)", "Physics for medical entrance"),
    CHEMISTRY_MEDICAL("Chemistry (Medical)", "Chemistry for medical entrance"),
    
    // General Studies
    GENERAL_KNOWLEDGE("General Knowledge", "Current affairs and general awareness"),
    REASONING("Reasoning", "Logical and analytical reasoning"),
    ENGLISH_LANGUAGE("English Language", "English comprehension and grammar"),
    QUANTITATIVE_APTITUDE("Quantitative Aptitude", "Mathematical aptitude and problem solving"),
    
    // Computer Science
    COMPUTER_SCIENCE("Computer Science", "Computer science for competitive exams"),
    PROGRAMMING("Programming", "Programming languages and concepts"),
    
    // Commerce
    ACCOUNTANCY("Accountancy", "Financial accounting for competitive exams"),
    BUSINESS_STUDIES("Business Studies", "Business and management concepts"),
    ECONOMICS("Economics", "Economic principles and applications"),
    
    // Law
    LEGAL_APTITUDE("Legal Aptitude", "Legal reasoning and principles"),
    CONSTITUTIONAL_LAW("Constitutional Law", "Indian constitution and legal framework"),
    
    // Banking and Finance
    BANKING_AWARENESS("Banking Awareness", "Banking and financial services"),
    FINANCIAL_AWARENESS("Financial Awareness", "Financial markets and instruments"),
    
    // Teaching
    TEACHING_APTITUDE("Teaching Aptitude", "Teaching methodology and psychology"),
    RESEARCH_APTITUDE("Research Aptitude", "Research methodology and techniques");
    
    private final String displayName;
    private final String description;
    
    CompetitiveSubject(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
```

### Professional Subject Enum
```java
package com.coaxialacademy.entity;

public enum ProfessionalSubject {
    // Technology
    SOFTWARE_DEVELOPMENT("Software Development", "Programming and software engineering"),
    WEB_DEVELOPMENT("Web Development", "Frontend and backend web technologies"),
    MOBILE_DEVELOPMENT("Mobile Development", "Mobile app development"),
    DATA_SCIENCE("Data Science", "Data analysis and machine learning"),
    CYBERSECURITY("Cybersecurity", "Information security and protection"),
    CLOUD_COMPUTING("Cloud Computing", "Cloud platforms and services"),
    DEVOPS("DevOps", "Development and operations practices"),
    
    // Business
    PROJECT_MANAGEMENT("Project Management", "Project planning and execution"),
    BUSINESS_ANALYSIS("Business Analysis", "Business process analysis and improvement"),
    DIGITAL_MARKETING("Digital Marketing", "Online marketing strategies and tools"),
    SALES_MANAGEMENT("Sales Management", "Sales techniques and customer relations"),
    HUMAN_RESOURCES("Human Resources", "HR management and practices"),
    FINANCIAL_MANAGEMENT("Financial Management", "Corporate finance and investment"),
    
    // Design
    GRAPHIC_DESIGN("Graphic Design", "Visual design and branding"),
    UI_UX_DESIGN("UI/UX Design", "User interface and experience design"),
    WEB_DESIGN("Web Design", "Website design and layout"),
    
    // Healthcare
    NURSING("Nursing", "Patient care and medical assistance"),
    PHARMACY("Pharmacy", "Pharmaceutical sciences and drug management"),
    MEDICAL_CODING("Medical Coding", "Medical billing and coding"),
    
    // Finance
    ACCOUNTING("Accounting", "Financial accounting and bookkeeping"),
    TAXATION("Taxation", "Tax laws and compliance"),
    AUDITING("Auditing", "Financial auditing and compliance"),
    INVESTMENT_ANALYSIS("Investment Analysis", "Investment strategies and portfolio management"),
    
    // Language and Communication
    TECHNICAL_WRITING("Technical Writing", "Documentation and technical communication"),
    CONTENT_WRITING("Content Writing", "Content creation and copywriting"),
    TRANSLATION("Translation", "Language translation services"),
    
    // Other Professional Skills
    LEADERSHIP("Leadership", "Leadership skills and team management"),
    COMMUNICATION_SKILLS("Communication Skills", "Professional communication and presentation"),
    TIME_MANAGEMENT("Time Management", "Productivity and time optimization"),
    CRITICAL_THINKING("Critical Thinking", "Analytical thinking and problem solving");
    
    private final String displayName;
    private final String description;
    
    ProfessionalSubject(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
```

## Entity Classes

### Subject Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Subject name is required")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false)
    private SubjectType subjectType;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by", length = 50)
    private String createdBy;
    
    @Column(name = "updated_by", length = 50)
    private String updatedBy;
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClassSubject> classSubjects = new ArrayList<>();
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExamSubject> examSubjects = new ArrayList<>();
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseSubject> courseSubjects = new ArrayList<>();
    
    // Constructors
    public Subject() {}
    
    public Subject(String name, String description, SubjectType subjectType) {
        this.name = name;
        this.description = description;
        this.subjectType = subjectType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public SubjectType getSubjectType() { return subjectType; }
    public void setSubjectType(SubjectType subjectType) { this.subjectType = subjectType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    
    public List<ClassSubject> getClassSubjects() { return classSubjects; }
    public void setClassSubjects(List<ClassSubject> classSubjects) { this.classSubjects = classSubjects; }
    
    public List<ExamSubject> getExamSubjects() { return examSubjects; }
    public void setExamSubjects(List<ExamSubject> examSubjects) { this.examSubjects = examSubjects; }
    
    public List<CourseSubject> getCourseSubjects() { return courseSubjects; }
    public void setCourseSubjects(List<CourseSubject> courseSubjects) { this.courseSubjects = courseSubjects; }
}
```

### SubjectType Enum
```java
package com.coaxialacademy.entity;

public enum SubjectType {
    ACADEMIC("Academic Subject"),
    COMPETITIVE("Competitive Exam Subject"),
    PROFESSIONAL("Professional Course Subject");
    
    private final String displayName;
    
    SubjectType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
```

### Junction Table Entities

### ClassSubject Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "class_subjects")
public class ClassSubject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class classEntity;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @Column(name = "is_compulsory")
    private Boolean isCompulsory = true;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    // Constructors, getters, and setters
    public ClassSubject() {}
    
    public ClassSubject(Class classEntity, Subject subject) {
        this.classEntity = classEntity;
        this.subject = subject;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Class getClassEntity() { return classEntity; }
    public void setClassEntity(Class classEntity) { this.classEntity = classEntity; }
    
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    
    public Boolean getIsCompulsory() { return isCompulsory; }
    public void setIsCompulsory(Boolean isCompulsory) { this.isCompulsory = isCompulsory; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
```

### ExamSubject Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "exam_subjects")
public class ExamSubject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @Column(name = "weightage", precision = 5, scale = 2)
    private BigDecimal weightage = new BigDecimal("100.00");
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    // Constructors, getters, and setters
    public ExamSubject() {}
    
    public ExamSubject(Exam exam, Subject subject) {
        this.exam = exam;
        this.subject = subject;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
    
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    
    public BigDecimal getWeightage() { return weightage; }
    public void setWeightage(BigDecimal weightage) { this.weightage = weightage; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
```

### CourseSubject Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "course_subjects")
public class CourseSubject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @Column(name = "is_compulsory")
    private Boolean isCompulsory = true;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    // Constructors, getters, and setters
    public CourseSubject() {}
    
    public CourseSubject(Course course, Subject subject) {
        this.course = course;
        this.subject = subject;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    
    public Boolean getIsCompulsory() { return isCompulsory; }
    public void setIsCompulsory(Boolean isCompulsory) { this.isCompulsory = isCompulsory; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
```

## DTOs

### SubjectRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import com.coaxialacademy.entity.SubjectType;

public class SubjectRequestDTO {
    
    @NotBlank(message = "Subject name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Subject type is required")
    private SubjectType subjectType;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public SubjectRequestDTO() {}
    
    public SubjectRequestDTO(String name, String description, SubjectType subjectType) {
        this.name = name;
        this.description = description;
        this.subjectType = subjectType;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public SubjectType getSubjectType() { return subjectType; }
    public void setSubjectType(SubjectType subjectType) { this.subjectType = subjectType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### ClassSubjectRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

public class ClassSubjectRequestDTO {
    
    @NotNull(message = "Class ID is required")
    private Long classId;
    
    @NotNull(message = "Subject IDs are required")
    private List<Long> subjectIds;
    
    private Boolean isCompulsory = true;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    // Constructors
    public ClassSubjectRequestDTO() {}
    
    public ClassSubjectRequestDTO(Long classId, List<Long> subjectIds) {
        this.classId = classId;
        this.subjectIds = subjectIds;
    }
    
    // Getters and Setters
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    
    public List<Long> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(List<Long> subjectIds) { this.subjectIds = subjectIds; }
    
    public Boolean getIsCompulsory() { return isCompulsory; }
    public void setIsCompulsory(Boolean isCompulsory) { this.isCompulsory = isCompulsory; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
```

### ExamSubjectRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

public class ExamSubjectRequestDTO {
    
    @NotNull(message = "Exam ID is required")
    private Long examId;
    
    @NotNull(message = "Subject IDs are required")
    private List<Long> subjectIds;
    
    @DecimalMin(value = "0.0", message = "Weightage cannot be negative")
    private BigDecimal weightage = new BigDecimal("100.00");
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    // Constructors
    public ExamSubjectRequestDTO() {}
    
    public ExamSubjectRequestDTO(Long examId, List<Long> subjectIds) {
        this.examId = examId;
        this.subjectIds = subjectIds;
    }
    
    // Getters and Setters
    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
    
    public List<Long> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(List<Long> subjectIds) { this.subjectIds = subjectIds; }
    
    public BigDecimal getWeightage() { return weightage; }
    public void setWeightage(BigDecimal weightage) { this.weightage = weightage; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
```

### CourseSubjectRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

public class CourseSubjectRequestDTO {
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotNull(message = "Subject IDs are required")
    private List<Long> subjectIds;
    
    private Boolean isCompulsory = true;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    // Constructors
    public CourseSubjectRequestDTO() {}
    
    public CourseSubjectRequestDTO(Long courseId, List<Long> subjectIds) {
        this.courseId = courseId;
        this.subjectIds = subjectIds;
    }
    
    // Getters and Setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public List<Long> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(List<Long> subjectIds) { this.subjectIds = subjectIds; }
    
    public Boolean getIsCompulsory() { return isCompulsory; }
    public void setIsCompulsory(Boolean isCompulsory) { this.isCompulsory = isCompulsory; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
```

## Repository Layer

### SubjectRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Subject;
import com.coaxialacademy.entity.SubjectType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(SubjectType subjectType);
    
    List<Subject> findBySubjectTypeOrderByDisplayOrderAsc(SubjectType subjectType);
    
    Optional<Subject> findByNameAndSubjectType(String name, SubjectType subjectType);
    
    @Query("SELECT s FROM Subject s WHERE s.subjectType = :subjectType AND s.isActive = true ORDER BY s.displayOrder ASC")
    List<Subject> findActiveSubjectsByType(@Param("subjectType") SubjectType subjectType);
    
    @Query("SELECT s FROM Subject s WHERE s.name = :name AND s.subjectType = :subjectType AND s.id != :excludeId")
    Optional<Subject> findByNameAndSubjectTypeExcludingId(@Param("name") String name, @Param("subjectType") SubjectType subjectType, @Param("excludeId") Long excludeId);
    
    boolean existsByNameAndSubjectType(String name, SubjectType subjectType);
    
    boolean existsByNameAndSubjectTypeAndIdNot(String name, SubjectType subjectType, Long id);
}
```

## Service Layer

### SubjectService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.SubjectRequestDTO;
import com.coaxialacademy.entity.Subject;
import com.coaxialacademy.entity.SubjectType;
import com.coaxialacademy.entity.AcademicSubject;
import com.coaxialacademy.entity.CompetitiveSubject;
import com.coaxialacademy.entity.ProfessionalSubject;
import com.coaxialacademy.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SubjectService {
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }
    
    public List<Subject> getSubjectsByType(SubjectType subjectType) {
        return subjectRepository.findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(subjectType);
    }
    
    public List<Subject> getAcademicSubjects() {
        return subjectRepository.findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(SubjectType.ACADEMIC);
    }
    
    public List<Subject> getCompetitiveSubjects() {
        return subjectRepository.findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(SubjectType.COMPETITIVE);
    }
    
    public List<Subject> getProfessionalSubjects() {
        return subjectRepository.findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(SubjectType.PROFESSIONAL);
    }
    
    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }
    
    public Subject createSubject(SubjectRequestDTO subjectRequestDTO) {
        // Check for duplicate name within the same subject type
        if (subjectRepository.existsByNameAndSubjectType(subjectRequestDTO.getName(), subjectRequestDTO.getSubjectType())) {
            throw new IllegalArgumentException("Subject with name '" + subjectRequestDTO.getName() + "' already exists for this type");
        }
        
        Subject subject = new Subject();
        subject.setName(subjectRequestDTO.getName());
        subject.setDescription(subjectRequestDTO.getDescription());
        subject.setSubjectType(subjectRequestDTO.getSubjectType());
        subject.setDisplayOrder(subjectRequestDTO.getDisplayOrder());
        subject.setIsActive(subjectRequestDTO.getIsActive());
        
        return subjectRepository.save(subject);
    }
    
    public Subject updateSubject(Long id, SubjectRequestDTO subjectRequestDTO) {
        Subject existingSubject = subjectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id));
        
        // Check for duplicate name within the same subject type (excluding current subject)
        if (subjectRepository.existsByNameAndSubjectTypeAndIdNot(subjectRequestDTO.getName(), subjectRequestDTO.getSubjectType(), id)) {
            throw new IllegalArgumentException("Subject with name '" + subjectRequestDTO.getName() + "' already exists for this type");
        }
        
        existingSubject.setName(subjectRequestDTO.getName());
        existingSubject.setDescription(subjectRequestDTO.getDescription());
        existingSubject.setSubjectType(subjectRequestDTO.getSubjectType());
        existingSubject.setDisplayOrder(subjectRequestDTO.getDisplayOrder());
        existingSubject.setIsActive(subjectRequestDTO.getIsActive());
        
        return subjectRepository.save(existingSubject);
    }
    
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new IllegalArgumentException("Subject not found with ID: " + id);
        }
        subjectRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return subjectRepository.existsById(id);
    }
    
    // Initialize predefined subjects
    @Transactional
    public void initializePredefinedSubjects() {
        // Initialize Academic Subjects
        for (AcademicSubject academicSubject : AcademicSubject.values()) {
            if (!subjectRepository.existsByNameAndSubjectType(academicSubject.getDisplayName(), SubjectType.ACADEMIC)) {
                Subject subject = new Subject();
                subject.setName(academicSubject.getDisplayName());
                subject.setDescription(academicSubject.getDescription());
                subject.setSubjectType(SubjectType.ACADEMIC);
                subject.setIsActive(true);
                subjectRepository.save(subject);
            }
        }
        
        // Initialize Competitive Subjects
        for (CompetitiveSubject competitiveSubject : CompetitiveSubject.values()) {
            if (!subjectRepository.existsByNameAndSubjectType(competitiveSubject.getDisplayName(), SubjectType.COMPETITIVE)) {
                Subject subject = new Subject();
                subject.setName(competitiveSubject.getDisplayName());
                subject.setDescription(competitiveSubject.getDescription());
                subject.setSubjectType(SubjectType.COMPETITIVE);
                subject.setIsActive(true);
                subjectRepository.save(subject);
            }
        }
        
        // Initialize Professional Subjects
        for (ProfessionalSubject professionalSubject : ProfessionalSubject.values()) {
            if (!subjectRepository.existsByNameAndSubjectType(professionalSubject.getDisplayName(), SubjectType.PROFESSIONAL)) {
                Subject subject = new Subject();
                subject.setName(professionalSubject.getDisplayName());
                subject.setDescription(professionalSubject.getDescription());
                subject.setSubjectType(SubjectType.PROFESSIONAL);
                subject.setIsActive(true);
                subjectRepository.save(subject);
            }
        }
    }
}
```

## Controller Layer

### SubjectController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.SubjectRequestDTO;
import com.coaxialacademy.entity.Subject;
import com.coaxialacademy.entity.SubjectType;
import com.coaxialacademy.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/master-data/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {
    
    @Autowired
    private SubjectService subjectService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        List<Subject> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }
    
    @GetMapping("/type/{subjectType}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Subject>> getSubjectsByType(@PathVariable SubjectType subjectType) {
        List<Subject> subjects = subjectService.getSubjectsByType(subjectType);
        return ResponseEntity.ok(subjects);
    }
    
    @GetMapping("/academic")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Subject>> getAcademicSubjects() {
        List<Subject> subjects = subjectService.getAcademicSubjects();
        return ResponseEntity.ok(subjects);
    }
    
    @GetMapping("/competitive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Subject>> getCompetitiveSubjects() {
        List<Subject> subjects = subjectService.getCompetitiveSubjects();
        return ResponseEntity.ok(subjects);
    }
    
    @GetMapping("/professional")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Subject>> getProfessionalSubjects() {
        List<Subject> subjects = subjectService.getProfessionalSubjects();
        return ResponseEntity.ok(subjects);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        Optional<Subject> subject = subjectService.getSubjectById(id);
        return subject.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody SubjectRequestDTO subjectRequestDTO) {
        try {
            Subject createdSubject = subjectService.createSubject(subjectRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSubject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequestDTO subjectRequestDTO) {
        try {
            Subject updatedSubject = subjectService.updateSubject(id, subjectRequestDTO);
            return ResponseEntity.ok(updatedSubject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> initializePredefinedSubjects() {
        try {
            subjectService.initializePredefinedSubjects();
            return ResponseEntity.ok("Predefined subjects initialized successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Failed to initialize predefined subjects: " + e.getMessage());
        }
    }
}
```

## API Endpoints

### Subject Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/master-data/subjects` | Get all subjects | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/subjects/type/{subjectType}` | Get subjects by type | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/subjects/academic` | Get academic subjects | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/subjects/competitive` | Get competitive subjects | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/subjects/professional` | Get professional subjects | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/subjects/{id}` | Get subject by ID | ADMIN, INSTRUCTOR |
| POST | `/api/admin/master-data/subjects` | Create new subject | ADMIN |
| PUT | `/api/admin/master-data/subjects/{id}` | Update subject | ADMIN |
| DELETE | `/api/admin/master-data/subjects/{id}` | Delete subject | ADMIN |
| POST | `/api/admin/master-data/subjects/initialize` | Initialize predefined subjects | ADMIN |

## Request/Response Examples

### Get Academic Subjects
```json
GET /api/admin/master-data/subjects/academic

Response:
[
  {
    "id": 1,
    "name": "Mathematics",
    "description": "Core mathematical concepts and problem solving",
    "subjectType": "ACADEMIC",
    "displayOrder": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Physics",
    "description": "Physical sciences and natural phenomena",
    "subjectType": "ACADEMIC",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

### Get Competitive Subjects
```json
GET /api/admin/master-data/subjects/competitive

Response:
[
  {
    "id": 10,
    "name": "Mathematics",
    "description": "Advanced mathematics for engineering",
    "subjectType": "COMPETITIVE",
    "displayOrder": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 11,
    "name": "General Knowledge",
    "description": "Current affairs and general awareness",
    "subjectType": "COMPETITIVE",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

### Get Professional Subjects
```json
GET /api/admin/master-data/subjects/professional

Response:
[
  {
    "id": 20,
    "name": "Software Development",
    "description": "Programming and software engineering",
    "subjectType": "PROFESSIONAL",
    "displayOrder": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 21,
    "name": "Project Management",
    "description": "Project planning and execution",
    "subjectType": "PROFESSIONAL",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

## Frontend Integration

### Conditional Form Fields Based on Course Type

#### 1. Academic Course (Class-Subject Relationship)
```javascript
// Form fields for Academic courses
const academicFormFields = [
  { name: 'classId', type: 'select', label: 'Select Class', required: true },
  { name: 'subjectIds', type: 'multiselect', label: 'Select Subjects', required: true },
  { name: 'isCompulsory', type: 'checkbox', label: 'Compulsory Subject' }
];
```

#### 2. Competitive Course (Exam-Subject Relationship)
```javascript
// Form fields for Competitive courses
const competitiveFormFields = [
  { name: 'examId', type: 'select', label: 'Select Exam', required: true },
  { name: 'subjectIds', type: 'multiselect', label: 'Select Subjects', required: true },
  { name: 'weightage', type: 'number', label: 'Weightage (%)', required: true }
];
```

#### 3. Professional Course (Course-Subject Relationship)
```javascript
// Form fields for Professional courses
const professionalFormFields = [
  { name: 'courseId', type: 'select', label: 'Select Course', required: true },
  { name: 'subjectIds', type: 'multiselect', label: 'Select Subjects', required: true },
  { name: 'isCompulsory', type: 'checkbox', label: 'Compulsory Subject' }
];
```

### Dynamic Form Rendering
```javascript
const getFormFields = (courseType) => {
  switch (courseType) {
    case 'ACADEMIC':
      return academicFormFields;
    case 'COMPETITIVE':
      return competitiveFormFields;
    case 'PROFESSIONAL':
      return professionalFormFields;
    default:
      return [];
  }
};
```

This implementation provides a complete Subject management system with predefined subjects and conditional form fields based on course types! 🚀
