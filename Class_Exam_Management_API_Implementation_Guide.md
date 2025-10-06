# Class/Exam Management API Implementation Guide

## Overview
This guide provides a complete implementation for Class and Exam Management APIs in Spring Boot, with conditional linking to courses based on CourseType structure (Academic uses Classes, Competitive uses Exams).

## Database Schema

### Classes Table (for Academic courses)
```sql
CREATE TABLE classes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_course_id (course_id),
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### Exams Table (for Competitive courses)
```sql
CREATE TABLE exams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    duration_minutes INT,
    total_marks DECIMAL(10,2),
    passing_marks DECIMAL(10,2),
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_course_id (course_id),
    INDEX idx_name (name),
    INDEX idx_exam_type (exam_type),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### Class-Subject Junction Table
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

### Exam-Subject Junction Table
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

## Entity Classes

### Class Entity
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
@Table(name = "classes")
public class Class {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Class name is required")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Course is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
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
    
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClassSubject> classSubjects = new ArrayList<>();
    
    // Constructors
    public Class() {}
    
    public Class(String name, String description, Course course) {
        this.name = name;
        this.description = description;
        this.course = course;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    
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
}
```

### Exam Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
public class Exam {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Exam name is required")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Course is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false)
    private ExamType examType = ExamType.STANDARD;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Min(value = 0, message = "Total marks cannot be negative")
    @Column(name = "total_marks", precision = 10, scale = 2)
    private BigDecimal totalMarks;
    
    @Min(value = 0, message = "Passing marks cannot be negative")
    @Column(name = "passing_marks", precision = 10, scale = 2)
    private BigDecimal passingMarks;
    
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
    
    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExamSubject> examSubjects = new ArrayList<>();
    
    // Constructors
    public Exam() {}
    
    public Exam(String name, String description, Course course, ExamType examType) {
        this.name = name;
        this.description = description;
        this.course = course;
        this.examType = examType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    
    public ExamType getExamType() { return examType; }
    public void setExamType(ExamType examType) { this.examType = examType; }
    
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }
    
    public BigDecimal getPassingMarks() { return passingMarks; }
    public void setPassingMarks(BigDecimal passingMarks) { this.passingMarks = passingMarks; }
    
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
    
    public List<ExamSubject> getExamSubjects() { return examSubjects; }
    public void setExamSubjects(List<ExamSubject> examSubjects) { this.examSubjects = examSubjects; }
}
```

### ExamType Enum
```java
package com.coaxialacademy.entity;

public enum ExamType {
    STANDARD("Standard Exam"),
    MOCK("Mock Test"),
    PRACTICE("Practice Test"),
    FINAL("Final Exam"),
    MIDTERM("Midterm Exam"),
    QUIZ("Quiz"),
    ASSIGNMENT("Assignment");
    
    private final String displayName;
    
    ExamType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
```

## DTOs

### ClassRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class ClassRequestDTO {
    
    @NotBlank(message = "Class name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public ClassRequestDTO() {}
    
    public ClassRequestDTO(String name, String description, Long courseId) {
        this.name = name;
        this.description = description;
        this.courseId = courseId;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### ExamRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import com.coaxialacademy.entity.ExamType;
import java.math.BigDecimal;

public class ExamRequestDTO {
    
    @NotBlank(message = "Exam name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotNull(message = "Exam type is required")
    private ExamType examType = ExamType.STANDARD;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;
    
    @Min(value = 0, message = "Total marks cannot be negative")
    private BigDecimal totalMarks;
    
    @Min(value = 0, message = "Passing marks cannot be negative")
    private BigDecimal passingMarks;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public ExamRequestDTO() {}
    
    public ExamRequestDTO(String name, String description, Long courseId, ExamType examType) {
        this.name = name;
        this.description = description;
        this.courseId = courseId;
        this.examType = examType;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public ExamType getExamType() { return examType; }
    public void setExamType(ExamType examType) { this.examType = examType; }
    
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }
    
    public BigDecimal getPassingMarks() { return passingMarks; }
    public void setPassingMarks(BigDecimal passingMarks) { this.passingMarks = passingMarks; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

## Repository Layer

### ClassRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    
    List<Class> findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(Long courseId);
    
    List<Class> findByCourseIdOrderByDisplayOrderAsc(Long courseId);
    
    Optional<Class> findByNameAndCourseId(String name, Long courseId);
    
    @Query("SELECT c FROM Class c WHERE c.course.courseType.structureType = 'ACADEMIC' AND c.isActive = true")
    List<Class> findActiveAcademicClasses();
    
    @Query("SELECT c FROM Class c WHERE c.course.id = :courseId AND c.name = :name AND c.id != :excludeId")
    Optional<Class> findByNameAndCourseIdExcludingId(@Param("name") String name, @Param("courseId") Long courseId, @Param("excludeId") Long excludeId);
    
    boolean existsByNameAndCourseId(String name, Long courseId);
    
    boolean existsByNameAndCourseIdAndIdNot(String name, Long courseId, Long id);
}
```

### ExamRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Exam;
import com.coaxialacademy.entity.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    List<Exam> findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(Long courseId);
    
    List<Exam> findByCourseIdOrderByDisplayOrderAsc(Long courseId);
    
    Optional<Exam> findByNameAndCourseId(String name, Long courseId);
    
    List<Exam> findByExamTypeAndIsActiveTrue(ExamType examType);
    
    @Query("SELECT e FROM Exam e WHERE e.course.courseType.structureType = 'COMPETITIVE' AND e.isActive = true")
    List<Exam> findActiveCompetitiveExams();
    
    @Query("SELECT e FROM Exam e WHERE e.course.id = :courseId AND e.name = :name AND e.id != :excludeId")
    Optional<Exam> findByNameAndCourseIdExcludingId(@Param("name") String name, @Param("courseId") Long courseId, @Param("excludeId") Long excludeId);
    
    boolean existsByNameAndCourseId(String name, Long courseId);
    
    boolean existsByNameAndCourseIdAndIdNot(String name, Long courseId, Long id);
}
```

## Service Layer

### ClassService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.ClassRequestDTO;
import com.coaxialacademy.entity.Class;
import com.coaxialacademy.entity.Course;
import com.coaxialacademy.repository.ClassRepository;
import com.coaxialacademy.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClassService {
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<Class> getAllClasses() {
        return classRepository.findAll();
    }
    
    public List<Class> getClassesByCourseId(Long courseId) {
        return classRepository.findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(courseId);
    }
    
    public List<Class> getActiveAcademicClasses() {
        return classRepository.findActiveAcademicClasses();
    }
    
    public Optional<Class> getClassById(Long id) {
        return classRepository.findById(id);
    }
    
    public Class createClass(ClassRequestDTO classRequestDTO) {
        // Validate course exists and is Academic type
        Course course = courseRepository.findById(classRequestDTO.getCourseId())
            .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + classRequestDTO.getCourseId()));
        
        if (!"ACADEMIC".equals(course.getCourseType().getStructureType())) {
            throw new IllegalArgumentException("Classes can only be created for Academic course types");
        }
        
        // Check for duplicate name within the same course
        if (classRepository.existsByNameAndCourseId(classRequestDTO.getName(), classRequestDTO.getCourseId())) {
            throw new IllegalArgumentException("Class with name '" + classRequestDTO.getName() + "' already exists in this course");
        }
        
        Class classEntity = new Class();
        classEntity.setName(classRequestDTO.getName());
        classEntity.setDescription(classRequestDTO.getDescription());
        classEntity.setCourse(course);
        classEntity.setDisplayOrder(classRequestDTO.getDisplayOrder());
        classEntity.setIsActive(classRequestDTO.getIsActive());
        
        return classRepository.save(classEntity);
    }
    
    public Class updateClass(Long id, ClassRequestDTO classRequestDTO) {
        Class existingClass = classRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Class not found with ID: " + id));
        
        // Validate course exists and is Academic type
        Course course = courseRepository.findById(classRequestDTO.getCourseId())
            .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + classRequestDTO.getCourseId()));
        
        if (!"ACADEMIC".equals(course.getCourseType().getStructureType())) {
            throw new IllegalArgumentException("Classes can only be created for Academic course types");
        }
        
        // Check for duplicate name within the same course (excluding current class)
        if (classRepository.existsByNameAndCourseIdAndIdNot(classRequestDTO.getName(), classRequestDTO.getCourseId(), id)) {
            throw new IllegalArgumentException("Class with name '" + classRequestDTO.getName() + "' already exists in this course");
        }
        
        existingClass.setName(classRequestDTO.getName());
        existingClass.setDescription(classRequestDTO.getDescription());
        existingClass.setCourse(course);
        existingClass.setDisplayOrder(classRequestDTO.getDisplayOrder());
        existingClass.setIsActive(classRequestDTO.getIsActive());
        
        return classRepository.save(existingClass);
    }
    
    public void deleteClass(Long id) {
        if (!classRepository.existsById(id)) {
            throw new IllegalArgumentException("Class not found with ID: " + id);
        }
        classRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return classRepository.existsById(id);
    }
}
```

### ExamService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.ExamRequestDTO;
import com.coaxialacademy.entity.Exam;
import com.coaxialacademy.entity.Course;
import com.coaxialacademy.repository.ExamRepository;
import com.coaxialacademy.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ExamService {
    
    @Autowired
    private ExamRepository examRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
    
    public List<Exam> getExamsByCourseId(Long courseId) {
        return examRepository.findByCourseIdAndIsActiveTrueOrderByDisplayOrderAsc(courseId);
    }
    
    public List<Exam> getActiveCompetitiveExams() {
        return examRepository.findActiveCompetitiveExams();
    }
    
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }
    
    public Exam createExam(ExamRequestDTO examRequestDTO) {
        // Validate course exists and is Competitive type
        Course course = courseRepository.findById(examRequestDTO.getCourseId())
            .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + examRequestDTO.getCourseId()));
        
        if (!"COMPETITIVE".equals(course.getCourseType().getStructureType())) {
            throw new IllegalArgumentException("Exams can only be created for Competitive course types");
        }
        
        // Check for duplicate name within the same course
        if (examRepository.existsByNameAndCourseId(examRequestDTO.getName(), examRequestDTO.getCourseId())) {
            throw new IllegalArgumentException("Exam with name '" + examRequestDTO.getName() + "' already exists in this course");
        }
        
        Exam exam = new Exam();
        exam.setName(examRequestDTO.getName());
        exam.setDescription(examRequestDTO.getDescription());
        exam.setCourse(course);
        exam.setExamType(examRequestDTO.getExamType());
        exam.setDurationMinutes(examRequestDTO.getDurationMinutes());
        exam.setTotalMarks(examRequestDTO.getTotalMarks());
        exam.setPassingMarks(examRequestDTO.getPassingMarks());
        exam.setDisplayOrder(examRequestDTO.getDisplayOrder());
        exam.setIsActive(examRequestDTO.getIsActive());
        
        return examRepository.save(exam);
    }
    
    public Exam updateExam(Long id, ExamRequestDTO examRequestDTO) {
        Exam existingExam = examRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Exam not found with ID: " + id));
        
        // Validate course exists and is Competitive type
        Course course = courseRepository.findById(examRequestDTO.getCourseId())
            .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + examRequestDTO.getCourseId()));
        
        if (!"COMPETITIVE".equals(course.getCourseType().getStructureType())) {
            throw new IllegalArgumentException("Exams can only be created for Competitive course types");
        }
        
        // Check for duplicate name within the same course (excluding current exam)
        if (examRepository.existsByNameAndCourseIdAndIdNot(examRequestDTO.getName(), examRequestDTO.getCourseId(), id)) {
            throw new IllegalArgumentException("Exam with name '" + examRequestDTO.getName() + "' already exists in this course");
        }
        
        existingExam.setName(examRequestDTO.getName());
        existingExam.setDescription(examRequestDTO.getDescription());
        existingExam.setCourse(course);
        existingExam.setExamType(examRequestDTO.getExamType());
        existingExam.setDurationMinutes(examRequestDTO.getDurationMinutes());
        existingExam.setTotalMarks(examRequestDTO.getTotalMarks());
        existingExam.setPassingMarks(examRequestDTO.getPassingMarks());
        existingExam.setDisplayOrder(examRequestDTO.getDisplayOrder());
        existingExam.setIsActive(examRequestDTO.getIsActive());
        
        return examRepository.save(existingExam);
    }
    
    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new IllegalArgumentException("Exam not found with ID: " + id);
        }
        examRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return examRepository.existsById(id);
    }
}
```

## Controller Layer

### ClassController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.ClassRequestDTO;
import com.coaxialacademy.entity.Class;
import com.coaxialacademy.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClassController {
    
    @Autowired
    private ClassService classService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Class>> getAllClasses() {
        List<Class> classes = classService.getAllClasses();
        return ResponseEntity.ok(classes);
    }
    
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Class>> getClassesByCourseId(@PathVariable Long courseId) {
        List<Class> classes = classService.getClassesByCourseId(courseId);
        return ResponseEntity.ok(classes);
    }
    
    @GetMapping("/academic")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Class>> getActiveAcademicClasses() {
        List<Class> classes = classService.getActiveAcademicClasses();
        return ResponseEntity.ok(classes);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Class> getClassById(@PathVariable Long id) {
        Optional<Class> classEntity = classService.getClassById(id);
        return classEntity.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Class> createClass(@Valid @RequestBody ClassRequestDTO classRequestDTO) {
        try {
            Class createdClass = classService.createClass(classRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdClass);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Class> updateClass(@PathVariable Long id, @Valid @RequestBody ClassRequestDTO classRequestDTO) {
        try {
            Class updatedClass = classService.updateClass(id, classRequestDTO);
            return ResponseEntity.ok(updatedClass);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

### ExamController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.ExamRequestDTO;
import com.coaxialacademy.entity.Exam;
import com.coaxialacademy.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {
    
    @Autowired
    private ExamService examService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Exam>> getAllExams() {
        List<Exam> exams = examService.getAllExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Exam>> getExamsByCourseId(@PathVariable Long courseId) {
        List<Exam> exams = examService.getExamsByCourseId(courseId);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/competitive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Exam>> getActiveCompetitiveExams() {
        List<Exam> exams = examService.getActiveCompetitiveExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Optional<Exam> exam = examService.getExamById(id);
        return exam.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> createExam(@Valid @RequestBody ExamRequestDTO examRequestDTO) {
        try {
            Exam createdExam = examService.createExam(examRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdExam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequestDTO examRequestDTO) {
        try {
            Exam updatedExam = examService.updateExam(id, examRequestDTO);
            return ResponseEntity.ok(updatedExam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        try {
            examService.deleteExam(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

## API Endpoints

### Class Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/classes` | Get all classes | ADMIN, INSTRUCTOR |
| GET | `/api/classes/course/{courseId}` | Get classes by course ID | ADMIN, INSTRUCTOR |
| GET | `/api/classes/academic` | Get active academic classes | ADMIN, INSTRUCTOR |
| GET | `/api/classes/{id}` | Get class by ID | ADMIN, INSTRUCTOR |
| POST | `/api/classes` | Create new class | ADMIN |
| PUT | `/api/classes/{id}` | Update class | ADMIN |
| DELETE | `/api/classes/{id}` | Delete class | ADMIN |

### Exam Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/exams` | Get all exams | ADMIN, INSTRUCTOR |
| GET | `/api/exams/course/{courseId}` | Get exams by course ID | ADMIN, INSTRUCTOR |
| GET | `/api/exams/competitive` | Get active competitive exams | ADMIN, INSTRUCTOR |
| GET | `/api/exams/{id}` | Get exam by ID | ADMIN, INSTRUCTOR |
| POST | `/api/exams` | Create new exam | ADMIN |
| PUT | `/api/exams/{id}` | Update exam | ADMIN |
| DELETE | `/api/exams/{id}` | Delete exam | ADMIN |

## Request/Response Examples

### Create Class Request
```json
POST /api/classes
{
  "name": "Class 10A",
  "description": "Advanced Mathematics Class",
  "courseId": 1,
  "displayOrder": 1,
  "isActive": true
}
```

### Create Class Response
```json
{
  "id": 1,
  "name": "Class 10A",
  "description": "Advanced Mathematics Class",
  "course": {
    "id": 1,
    "name": "Mathematics Course",
    "courseType": {
      "structureType": "ACADEMIC"
    }
  },
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Create Exam Request
```json
POST /api/exams
{
  "name": "JEE Main 2024",
  "description": "Joint Entrance Examination Main 2024",
  "courseId": 2,
  "examType": "STANDARD",
  "durationMinutes": 180,
  "totalMarks": 300.00,
  "passingMarks": 120.00,
  "displayOrder": 1,
  "isActive": true
}
```

### Create Exam Response
```json
{
  "id": 1,
  "name": "JEE Main 2024",
  "description": "Joint Entrance Examination Main 2024",
  "course": {
    "id": 2,
    "name": "Engineering Entrance",
    "courseType": {
      "structureType": "COMPETITIVE"
    }
  },
  "examType": "STANDARD",
  "durationMinutes": 180,
  "totalMarks": 300.00,
  "passingMarks": 120.00,
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

## Conditional Logic Implementation

### Structure Type Validation
- **Classes** can only be created for courses with `structureType = "ACADEMIC"`
- **Exams** can only be created for courses with `structureType = "COMPETITIVE"`
- **Professional** and **Custom** course types skip this level entirely

### Frontend Integration
The frontend should:
1. Check the course's structure type before showing Class/Exam management
2. Only display Class management for Academic courses
3. Only display Exam management for Competitive courses
4. Skip this level for Professional and Custom courses

This implementation provides a complete, conditional Class/Exam management system that respects the hierarchical structure defined in your CourseType management! 🚀
