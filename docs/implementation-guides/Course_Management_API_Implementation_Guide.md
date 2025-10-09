# Course Management API Implementation Guide

## Overview
This guide provides a complete implementation for Course Management API in Spring Boot, supporting the hierarchical course structure based on Course Types (Academic, Competitive, Professional, Custom).

## Database Schema

### Courses Table
```sql
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_type_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_course_type (course_type_id),
    INDEX idx_active (is_active),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (course_type_id) REFERENCES course_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Classes Table (for Academic Course Type)
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
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_course (course_id),
    INDEX idx_active (is_active),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Exams Table (for Competitive Course Type)
```sql
CREATE TABLE exams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    exam_date DATE,
    registration_start_date DATE,
    registration_end_date DATE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_course (course_id),
    INDEX idx_active (is_active),
    INDEX idx_exam_date (exam_date),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

## Entity Classes

### Course Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@EntityListeners(AuditingEntityListener.class)
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Course type is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_type_id", nullable = false)
    private CourseType courseType;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    // Relationships based on course type structure
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Class> classes = new ArrayList<>();
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Exam> exams = new ArrayList<>();
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();
    
    // Constructors
    public Course() {}
    
    public Course(String name, String description, CourseType courseType) {
        this.name = name;
        this.description = description;
        this.courseType = courseType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public CourseType getCourseType() { return courseType; }
    public void setCourseType(CourseType courseType) { this.courseType = courseType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
    
    public List<Class> getClasses() { return classes; }
    public void setClasses(List<Class> classes) { this.classes = classes; }
    
    public List<Exam> getExams() { return exams; }
    public void setExams(List<Exam> exams) { this.exams = exams; }
    
    public List<Subject> getSubjects() { return subjects; }
    public void setSubjects(List<Subject> subjects) { this.subjects = subjects; }
}
```

### Class Entity (for Academic Structure)
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
@EntityListeners(AuditingEntityListener.class)
public class Class {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Class name is required")
    @Size(max = 100, message = "Class name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Course is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();
    
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
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
    
    public List<Subject> getSubjects() { return subjects; }
    public void setSubjects(List<Subject> subjects) { this.subjects = subjects; }
}
```

### Exam Entity (for Competitive Structure)
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
@EntityListeners(AuditingEntityListener.class)
public class Exam {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Exam name is required")
    @Size(max = 100, message = "Exam name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Course is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "exam_date")
    private LocalDate examDate;
    
    @Column(name = "registration_start_date")
    private LocalDate registrationStartDate;
    
    @Column(name = "registration_end_date")
    private LocalDate registrationEndDate;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();
    
    // Constructors
    public Exam() {}
    
    public Exam(String name, String description, Course course) {
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
    
    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }
    
    public LocalDate getRegistrationStartDate() { return registrationStartDate; }
    public void setRegistrationStartDate(LocalDate registrationStartDate) { this.registrationStartDate = registrationStartDate; }
    
    public LocalDate getRegistrationEndDate() { return registrationEndDate; }
    public void setRegistrationEndDate(LocalDate registrationEndDate) { this.registrationEndDate = registrationEndDate; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
    
    public List<Subject> getSubjects() { return subjects; }
    public void setSubjects(List<Subject> subjects) { this.subjects = subjects; }
}
```

## DTOs (Data Transfer Objects)

### CourseRequest DTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.*;
import com.coaxialacademy.entity.CourseType;

public class CourseRequest {
    
    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name must not exceed 100 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Course type is required")
    private CourseType courseType;
    
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public CourseRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public CourseType getCourseType() { return courseType; }
    public void setCourseType(CourseType courseType) { this.courseType = courseType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### CourseResponse DTO
```java
package com.coaxialacademy.dto.response;

import com.coaxialacademy.entity.CourseType;
import java.time.LocalDateTime;
import java.util.List;

public class CourseResponse {
    
    private Long id;
    private String name;
    private String description;
    private CourseType courseType;
    private String courseTypeName;
    private String structureType;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private String updatedByName;
    
    // Hierarchical data based on course type
    private List<ClassInfo> classes;
    private List<ExamInfo> exams;
    private List<SubjectInfo> subjects;
    
    // Constructors
    public CourseResponse() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public CourseType getCourseType() { return courseType; }
    public void setCourseType(CourseType courseType) { this.courseType = courseType; }
    
    public String getCourseTypeName() { return courseTypeName; }
    public void setCourseTypeName(String courseTypeName) { this.courseTypeName = courseTypeName; }
    
    public String getStructureType() { return structureType; }
    public void setStructureType(String structureType) { this.structureType = structureType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    
    public String getUpdatedByName() { return updatedByName; }
    public void setUpdatedByName(String updatedByName) { this.updatedByName = updatedByName; }
    
    public List<ClassInfo> getClasses() { return classes; }
    public void setClasses(List<ClassInfo> classes) { this.classes = classes; }
    
    public List<ExamInfo> getExams() { return exams; }
    public void setExams(List<ExamInfo> exams) { this.exams = exams; }
    
    public List<SubjectInfo> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectInfo> subjects) { this.subjects = subjects; }
}
```

### ClassRequest DTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.*;

public class ClassRequest {
    
    @NotBlank(message = "Class name is required")
    @Size(max = 100, message = "Class name must not exceed 100 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Course is required")
    private Long courseId;
    
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public ClassRequest() {}
    
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

### ExamRequest DTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class ExamRequest {
    
    @NotBlank(message = "Exam name is required")
    @Size(max = 100, message = "Exam name must not exceed 100 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Course is required")
    private Long courseId;
    
    private LocalDate examDate;
    
    private LocalDate registrationStartDate;
    
    private LocalDate registrationEndDate;
    
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public ExamRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }
    
    public LocalDate getRegistrationStartDate() { return registrationStartDate; }
    public void setRegistrationStartDate(LocalDate registrationStartDate) { this.registrationStartDate = registrationStartDate; }
    
    public LocalDate getRegistrationEndDate() { return registrationEndDate; }
    public void setRegistrationEndDate(LocalDate registrationEndDate) { this.registrationEndDate = registrationEndDate; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

## Repository Interfaces

### CourseRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Course;
import com.coaxialacademy.entity.CourseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // Find by course type
    List<Course> findByCourseType(CourseType courseType);
    
    // Find by course type and active status
    List<Course> findByCourseTypeAndIsActive(CourseType courseType, Boolean isActive);
    
    // Find active courses
    List<Course> findByIsActive(Boolean isActive);
    
    // Search courses by name
    @Query("SELECT c FROM Course c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Course> searchCourses(@Param("search") String search);
    
    // Find courses with filters
    @Query("SELECT c FROM Course c WHERE " +
           "(:courseTypeId IS NULL OR c.courseType.id = :courseTypeId) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive) AND " +
           "(:search IS NULL OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Course> findCoursesWithFilters(@Param("courseTypeId") Long courseTypeId, 
                                       @Param("isActive") Boolean isActive, 
                                       @Param("search") String search, 
                                       Pageable pageable);
    
    // Count courses by course type
    long countByCourseType(CourseType courseType);
    
    // Count active courses
    long countByIsActive(Boolean isActive);
    
    // Find courses by display order
    List<Course> findByCourseTypeOrderByDisplayOrderAsc(CourseType courseType);
    
    // Check if course name exists within course type
    boolean existsByNameAndCourseType(String name, CourseType courseType);
    
    // Check if course name exists within course type (excluding current course)
    boolean existsByNameAndCourseTypeAndIdNot(String name, CourseType courseType, Long id);
}
```

### ClassRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Class;
import com.coaxialacademy.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    
    // Find by course
    List<Class> findByCourse(Course course);
    
    // Find by course and active status
    List<Class> findByCourseAndIsActive(Course course, Boolean isActive);
    
    // Find active classes
    List<Class> findByIsActive(Boolean isActive);
    
    // Find classes by display order
    List<Class> findByCourseOrderByDisplayOrderAsc(Course course);
    
    // Search classes by name
    @Query("SELECT c FROM Class c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Class> searchClasses(@Param("search") String search);
    
    // Check if class name exists within course
    boolean existsByNameAndCourse(String name, Course course);
    
    // Check if class name exists within course (excluding current class)
    boolean existsByNameAndCourseAndIdNot(String name, Course course, Long id);
}
```

### ExamRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Exam;
import com.coaxialacademy.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    // Find by course
    List<Exam> findByCourse(Course course);
    
    // Find by course and active status
    List<Exam> findByCourseAndIsActive(Course course, Boolean isActive);
    
    // Find active exams
    List<Exam> findByIsActive(Boolean isActive);
    
    // Find exams by display order
    List<Exam> findByCourseOrderByDisplayOrderAsc(Course course);
    
    // Find upcoming exams
    List<Exam> findByExamDateAfterAndIsActive(LocalDate date, Boolean isActive);
    
    // Find exams by date range
    List<Exam> findByExamDateBetweenAndIsActive(LocalDate startDate, LocalDate endDate, Boolean isActive);
    
    // Search exams by name
    @Query("SELECT e FROM Exam e WHERE " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Exam> searchExams(@Param("search") String search);
    
    // Check if exam name exists within course
    boolean existsByNameAndCourse(String name, Course course);
    
    // Check if exam name exists within course (excluding current exam)
    boolean existsByNameAndCourseAndIdNot(String name, Course course, Long id);
}
```

## Service Layer

### CourseService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.CourseRequest;
import com.coaxialacademy.dto.response.CourseResponse;
import com.coaxialacademy.entity.Course;
import com.coaxialacademy.entity.CourseType;
import com.coaxialacademy.entity.User;
import com.coaxialacademy.repository.CourseRepository;
import com.coaxialacademy.repository.CourseTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CourseTypeRepository courseTypeRepository;
    
    // Create new course
    public CourseResponse createCourse(CourseRequest courseRequest) {
        // Validate course type exists
        CourseType courseType = courseTypeRepository.findById(courseRequest.getCourseType().getId())
            .orElseThrow(() -> new IllegalArgumentException("Course type not found"));
        
        // Check if course name already exists within the course type
        if (courseRepository.existsByNameAndCourseType(courseRequest.getName(), courseType)) {
            throw new IllegalArgumentException("Course name already exists in this course type");
        }
        
        Course course = new Course();
        course.setName(courseRequest.getName());
        course.setDescription(courseRequest.getDescription());
        course.setCourseType(courseType);
        course.setDisplayOrder(courseRequest.getDisplayOrder());
        course.setIsActive(courseRequest.getIsActive());
        course.setCreatedBy(getCurrentUser());
        
        Course savedCourse = courseRepository.save(course);
        return convertToResponse(savedCourse);
    }
    
    // Get all courses with pagination and filters
    @Transactional(readOnly = true)
    public Page<CourseResponse> getCourses(Long courseTypeId, Boolean isActive, String search, Pageable pageable) {
        Page<Course> courses = courseRepository.findCoursesWithFilters(courseTypeId, isActive, search, pageable);
        return courses.map(this::convertToResponse);
    }
    
    // Get all courses without pagination
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses(Long courseTypeId, Boolean isActive, String search) {
        List<Course> courses;
        
        if (courseTypeId != null && isActive != null && search != null && !search.isEmpty()) {
            courses = courseRepository.findCoursesWithFilters(courseTypeId, isActive, search, Pageable.unpaged()).getContent();
        } else if (courseTypeId != null && isActive != null) {
            CourseType courseType = courseTypeRepository.findById(courseTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Course type not found"));
            courses = courseRepository.findByCourseTypeAndIsActive(courseType, isActive);
        } else if (courseTypeId != null) {
            CourseType courseType = courseTypeRepository.findById(courseTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Course type not found"));
            courses = courseRepository.findByCourseType(courseType);
        } else if (isActive != null) {
            courses = courseRepository.findByIsActive(isActive);
        } else if (search != null && !search.isEmpty()) {
            courses = courseRepository.searchCourses(search);
        } else {
            courses = courseRepository.findAll();
        }
        
        return courses.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Get course by ID
    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
        return convertToResponse(course);
    }
    
    // Update course
    public CourseResponse updateCourse(Long id, CourseRequest courseRequest) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
        
        // Validate course type exists
        CourseType courseType = courseTypeRepository.findById(courseRequest.getCourseType().getId())
            .orElseThrow(() -> new IllegalArgumentException("Course type not found"));
        
        // Check if course name is being changed and if it already exists
        if (!course.getName().equals(courseRequest.getName()) && 
            courseRepository.existsByNameAndCourseTypeAndIdNot(courseRequest.getName(), courseType, id)) {
            throw new IllegalArgumentException("Course name already exists in this course type");
        }
        
        // Update fields
        course.setName(courseRequest.getName());
        course.setDescription(courseRequest.getDescription());
        course.setCourseType(courseType);
        course.setDisplayOrder(courseRequest.getDisplayOrder());
        course.setIsActive(courseRequest.getIsActive());
        course.setUpdatedBy(getCurrentUser());
        
        Course updatedCourse = courseRepository.save(course);
        return convertToResponse(updatedCourse);
    }
    
    // Delete course
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new IllegalArgumentException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }
    
    // Get courses by course type
    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByCourseType(Long courseTypeId) {
        CourseType courseType = courseTypeRepository.findById(courseTypeId)
            .orElseThrow(() -> new IllegalArgumentException("Course type not found"));
        
        List<Course> courses = courseRepository.findByCourseTypeOrderByDisplayOrderAsc(courseType);
        return courses.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Convert Course entity to CourseResponse DTO
    private CourseResponse convertToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setName(course.getName());
        response.setDescription(course.getDescription());
        response.setCourseType(course.getCourseType());
        response.setCourseTypeName(course.getCourseType().getName());
        response.setStructureType(course.getCourseType().getStructureType().name());
        response.setDisplayOrder(course.getDisplayOrder());
        response.setIsActive(course.getIsActive());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        
        if (course.getCreatedBy() != null) {
            response.setCreatedByName(course.getCreatedBy().getFullName());
        }
        if (course.getUpdatedBy() != null) {
            response.setUpdatedByName(course.getUpdatedBy().getFullName());
        }
        
        // Add hierarchical data based on course type structure
        // This would be populated based on the course type structure
        // Implementation depends on the specific requirements
        
        return response;
    }
    
    // Get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }
}
```

## Controller Layer

### CourseController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.CourseRequest;
import com.coaxialacademy.dto.response.CourseResponse;
import com.coaxialacademy.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/master-data/courses")
@PreAuthorize("hasRole('ADMIN')")
public class CourseController {
    
    @Autowired
    private CourseService courseService;
    
    // Get all courses with filters and pagination
    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getCourses(
            @RequestParam(required = false) Long courseTypeId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CourseResponse> courses = courseService.getCourses(courseTypeId, isActive, search, pageable);
        return ResponseEntity.ok(courses);
    }
    
    // Get all courses without pagination
    @GetMapping("/all")
    public ResponseEntity<List<CourseResponse>> getAllCourses(
            @RequestParam(required = false) Long courseTypeId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search) {
        
        List<CourseResponse> courses = courseService.getAllCourses(courseTypeId, isActive, search);
        return ResponseEntity.ok(courses);
    }
    
    // Get course by ID
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }
    
    // Get courses by course type
    @GetMapping("/course-type/{courseTypeId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByCourseType(@PathVariable Long courseTypeId) {
        List<CourseResponse> courses = courseService.getCoursesByCourseType(courseTypeId);
        return ResponseEntity.ok(courses);
    }
    
    // Create new course
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest courseRequest) {
        CourseResponse course = courseService.createCourse(courseRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }
    
    // Update course
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id, 
                                                      @Valid @RequestBody CourseRequest courseRequest) {
        CourseResponse course = courseService.updateCourse(id, courseRequest);
        return ResponseEntity.ok(course);
    }
    
    // Delete course
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Course deleted successfully");
        return ResponseEntity.ok(response);
    }
}
```

## API Endpoints Summary

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/master-data/courses` | Get all courses with filters and pagination | ADMIN |
| GET | `/api/admin/master-data/courses/all` | Get all courses without pagination | ADMIN |
| GET | `/api/admin/master-data/courses/{id}` | Get course by ID | ADMIN |
| GET | `/api/admin/master-data/courses/course-type/{courseTypeId}` | Get courses by course type | ADMIN |
| POST | `/api/admin/master-data/courses` | Create new course | ADMIN |
| PUT | `/api/admin/master-data/courses/{id}` | Update course | ADMIN |
| DELETE | `/api/admin/master-data/courses/{id}` | Delete course | ADMIN |

## Request/Response Examples

### Create Course Request
```json
POST /api/admin/master-data/courses
{
  "name": "Mathematics Foundation",
  "description": "Comprehensive mathematics course covering basic to advanced topics",
  "courseType": {
    "id": 1
  },
  "displayOrder": 1,
  "isActive": true
}
```

### Course Response
```json
{
  "id": 1,
  "name": "Mathematics Foundation",
  "description": "Comprehensive mathematics course covering basic to advanced topics",
  "courseType": {
    "id": 1,
    "name": "Academic",
    "structureType": "ACADEMIC"
  },
  "courseTypeName": "Academic",
  "structureType": "ACADEMIC",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdByName": "John Doe",
  "updatedByName": null,
  "classes": [],
  "exams": [],
  "subjects": []
}
```

## Implementation Notes

### Course Type Structure Support
- **Academic**: Course → Class → Subject → Topic → Module → Chapter
- **Competitive**: Course → Exam → Subject → Topic → Module → Chapter  
- **Professional**: Course → Subject → Topic → Module → Chapter
- **Custom**: Flexible structure based on requirements

### Key Features
- **Hierarchical Management**: Supports different course structures based on course type
- **Validation**: Ensures unique course names within each course type
- **Audit Trail**: Tracks creation and modification by users
- **Flexible Filtering**: Filter by course type, active status, and search terms
- **Display Ordering**: Support for custom ordering of courses
- **Soft Delete**: Maintains data integrity with active/inactive status

This implementation provides a complete, production-ready Course Management API that integrates seamlessly with the existing Course Type Management system! 🚀
