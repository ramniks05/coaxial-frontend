# Class Management API Implementation Guide

## Overview
This guide provides a complete implementation for Class Management API in Spring Boot, specifically designed for Academic course structure where classes are the intermediate level between Courses and Subjects.

## Database Schema

### Classes Table
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
    INDEX idx_display_order (display_order),
    INDEX idx_course_display_order (course_id, display_order),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Class-Subject Relationship Table
```sql
CREATE TABLE class_subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    UNIQUE KEY unique_class_subject (class_id, subject_id),
    INDEX idx_class (class_id),
    INDEX idx_subject (subject_id),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

## Entity Classes

### Class Entity
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
    
    // Relationship with subjects through junction table
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
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
    
    public List<ClassSubject> getClassSubjects() { return classSubjects; }
    public void setClassSubjects(List<ClassSubject> classSubjects) { this.classSubjects = classSubjects; }
}
```

### ClassSubject Entity (Junction Table)
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "class_subjects", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "subject_id"}))
@EntityListeners(AuditingEntityListener.class)
public class ClassSubject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Class is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class classEntity;
    
    @NotNull(message = "Subject is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
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
    
    // Constructors
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
}
```

## DTOs (Data Transfer Objects)

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

### ClassResponse DTO
```java
package com.coaxialacademy.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class ClassResponse {
    
    private Long id;
    private String name;
    private String description;
    private Long courseId;
    private String courseName;
    private String courseTypeName;
    private String structureType;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private String updatedByName;
    private List<SubjectInfo> subjects;
    private Integer subjectCount;
    
    // Constructors
    public ClassResponse() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    
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
    
    public List<SubjectInfo> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectInfo> subjects) { this.subjects = subjects; }
    
    public Integer getSubjectCount() { return subjectCount; }
    public void setSubjectCount(Integer subjectCount) { this.subjectCount = subjectCount; }
}
```

### ClassSubjectRequest DTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.*;

public class ClassSubjectRequest {
    
    @NotNull(message = "Class ID is required")
    private Long classId;
    
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public ClassSubjectRequest() {}
    
    // Getters and Setters
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### ClassSubjectResponse DTO
```java
package com.coaxialacademy.dto.response;

import java.time.LocalDateTime;

public class ClassSubjectResponse {
    
    private Long id;
    private Long classId;
    private String className;
    private Long subjectId;
    private String subjectName;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
    private String updatedByName;
    
    // Constructors
    public ClassSubjectResponse() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }
    
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    
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
}
```

## Repository Interfaces

### ClassRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Class;
import com.coaxialacademy.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
    
    // Find classes by course ID
    List<Class> findByCourseId(Long courseId);
    
    // Find classes by course ID and active status
    List<Class> findByCourseIdAndIsActive(Long courseId, Boolean isActive);
    
    // Search classes by name
    @Query("SELECT c FROM Class c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Class> searchClasses(@Param("search") String search);
    
    // Find classes with filters
    @Query("SELECT c FROM Class c WHERE " +
           "(:courseId IS NULL OR c.course.id = :courseId) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive) AND " +
           "(:search IS NULL OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Class> findClassesWithFilters(@Param("courseId") Long courseId, 
                                      @Param("isActive") Boolean isActive, 
                                      @Param("search") String search, 
                                      Pageable pageable);
    
    // Count classes by course
    long countByCourse(Course course);
    
    // Count active classes
    long countByIsActive(Boolean isActive);
    
    // Check if class name exists within course
    boolean existsByNameAndCourse(String name, Course course);
    
    // Check if class name exists within course (excluding current class)
    boolean existsByNameAndCourseAndIdNot(String name, Course course, Long id);
    
    // Find classes with subject count
    @Query("SELECT c FROM Class c LEFT JOIN c.classSubjects cs " +
           "WHERE (:courseId IS NULL OR c.course.id = :courseId) " +
           "GROUP BY c.id")
    List<Class> findClassesWithSubjectCount(@Param("courseId") Long courseId);
}
```

### ClassSubjectRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.ClassSubject;
import com.coaxialacademy.entity.Class;
import com.coaxialacademy.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSubjectRepository extends JpaRepository<ClassSubject, Long> {
    
    // Find by class
    List<ClassSubject> findByClassEntity(Class classEntity);
    
    // Find by class and active status
    List<ClassSubject> findByClassEntityAndIsActive(Class classEntity, Boolean isActive);
    
    // Find by subject
    List<ClassSubject> findBySubject(Subject subject);
    
    // Find by subject and active status
    List<ClassSubject> findBySubjectAndIsActive(Subject subject, Boolean isActive);
    
    // Find by class ID
    List<ClassSubject> findByClassEntityId(Long classId);
    
    // Find by class ID and active status
    List<ClassSubject> findByClassEntityIdAndIsActive(Long classId, Boolean isActive);
    
    // Find by subject ID
    List<ClassSubject> findBySubjectId(Long subjectId);
    
    // Find by subject ID and active status
    List<ClassSubject> findBySubjectIdAndIsActive(Long subjectId, Boolean isActive);
    
    // Find by display order
    List<ClassSubject> findByClassEntityOrderByDisplayOrderAsc(Class classEntity);
    
    // Check if relationship exists
    boolean existsByClassEntityAndSubject(Class classEntity, Subject subject);
    
    // Check if relationship exists (excluding current)
    boolean existsByClassEntityAndSubjectAndIdNot(Class classEntity, Subject subject, Long id);
    
    // Find by class and subject
    Optional<ClassSubject> findByClassEntityAndSubject(Class classEntity, Subject subject);
    
    // Count subjects in class
    long countByClassEntityAndIsActive(Class classEntity, Boolean isActive);
    
    // Find classes for subject
    @Query("SELECT cs FROM ClassSubject cs WHERE cs.subject.id = :subjectId AND cs.isActive = true")
    List<ClassSubject> findActiveClassesForSubject(@Param("subjectId") Long subjectId);
    
    // Find subjects for class
    @Query("SELECT cs FROM ClassSubject cs WHERE cs.classEntity.id = :classId AND cs.isActive = true ORDER BY cs.displayOrder ASC")
    List<ClassSubject> findActiveSubjectsForClass(@Param("classId") Long classId);
}
```

## Service Layer

### ClassService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.ClassRequest;
import com.coaxialacademy.dto.response.ClassResponse;
import com.coaxialacademy.entity.Class;
import com.coaxialacademy.entity.Course;
import com.coaxialacademy.entity.User;
import com.coaxialacademy.repository.ClassRepository;
import com.coaxialacademy.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClassService {
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    // Create new class
    public ClassResponse createClass(ClassRequest classRequest) {
        // Validate course exists
        Course course = courseRepository.findById(classRequest.getCourseId())
            .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Check if class name already exists within the course
        if (classRepository.existsByNameAndCourse(classRequest.getName(), course)) {
            throw new IllegalArgumentException("Class name already exists in this course");
        }
        
        Class classEntity = new Class();
        classEntity.setName(classRequest.getName());
        classEntity.setDescription(classRequest.getDescription());
        classEntity.setCourse(course);
        classEntity.setDisplayOrder(classRequest.getDisplayOrder());
        classEntity.setIsActive(classRequest.getIsActive());
        classEntity.setCreatedBy(getCurrentUser());
        
        Class savedClass = classRepository.save(classEntity);
        return convertToResponse(savedClass);
    }
    
    // Get all classes with pagination and filters
    @Transactional(readOnly = true)
    public Page<ClassResponse> getClasses(Long courseId, Boolean isActive, String search, Pageable pageable) {
        Page<Class> classes = classRepository.findClassesWithFilters(courseId, isActive, search, pageable);
        return classes.map(this::convertToResponse);
    }
    
    // Get all classes without pagination
    @Transactional(readOnly = true)
    public List<ClassResponse> getAllClasses(Long courseId, Boolean isActive, String search) {
        List<Class> classes;
        
        if (courseId != null && isActive != null && search != null && !search.isEmpty()) {
            classes = classRepository.findClassesWithFilters(courseId, isActive, search, Pageable.unpaged()).getContent();
        } else if (courseId != null && isActive != null) {
            classes = classRepository.findByCourseIdAndIsActive(courseId, isActive);
        } else if (courseId != null) {
            classes = classRepository.findByCourseId(courseId);
        } else if (isActive != null) {
            classes = classRepository.findByIsActive(isActive);
        } else if (search != null && !search.isEmpty()) {
            classes = classRepository.searchClasses(search);
        } else {
            classes = classRepository.findAll();
        }
        
        return classes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Get class by ID
    @Transactional(readOnly = true)
    public ClassResponse getClassById(Long id) {
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + id));
        return convertToResponse(classEntity);
    }
    
    // Get classes by course
    @Transactional(readOnly = true)
    public List<ClassResponse> getClassesByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        List<Class> classes = classRepository.findByCourseOrderByDisplayOrderAsc(course);
        return classes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Update class
    public ClassResponse updateClass(Long id, ClassRequest classRequest) {
        Class classEntity = classRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + id));
        
        // Validate course exists
        Course course = courseRepository.findById(classRequest.getCourseId())
            .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Check if class name is being changed and if it already exists
        if (!classEntity.getName().equals(classRequest.getName()) && 
            classRepository.existsByNameAndCourseAndIdNot(classRequest.getName(), course, id)) {
            throw new IllegalArgumentException("Class name already exists in this course");
        }
        
        // Update fields
        classEntity.setName(classRequest.getName());
        classEntity.setDescription(classRequest.getDescription());
        classEntity.setCourse(course);
        classEntity.setDisplayOrder(classRequest.getDisplayOrder());
        classEntity.setIsActive(classRequest.getIsActive());
        classEntity.setUpdatedBy(getCurrentUser());
        
        Class updatedClass = classRepository.save(classEntity);
        return convertToResponse(updatedClass);
    }
    
    // Delete class
    public void deleteClass(Long id) {
        if (!classRepository.existsById(id)) {
            throw new IllegalArgumentException("Class not found with id: " + id);
        }
        classRepository.deleteById(id);
    }
    
    // Convert Class entity to ClassResponse DTO
    private ClassResponse convertToResponse(Class classEntity) {
        ClassResponse response = new ClassResponse();
        response.setId(classEntity.getId());
        response.setName(classEntity.getName());
        response.setDescription(classEntity.getDescription());
        response.setCourseId(classEntity.getCourse().getId());
        response.setCourseName(classEntity.getCourse().getName());
        response.setCourseTypeName(classEntity.getCourse().getCourseType().getName());
        response.setStructureType(classEntity.getCourse().getCourseType().getStructureType().name());
        response.setDisplayOrder(classEntity.getDisplayOrder());
        response.setIsActive(classEntity.getIsActive());
        response.setCreatedAt(classEntity.getCreatedAt());
        response.setUpdatedAt(classEntity.getUpdatedAt());
        
        if (classEntity.getCreatedBy() != null) {
            response.setCreatedByName(classEntity.getCreatedBy().getFullName());
        }
        if (classEntity.getUpdatedBy() != null) {
            response.setUpdatedByName(classEntity.getUpdatedBy().getFullName());
        }
        
        // Set subject count
        response.setSubjectCount(classEntity.getClassSubjects().size());
        
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

### ClassSubjectService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.ClassSubjectRequest;
import com.coaxialacademy.dto.response.ClassSubjectResponse;
import com.coaxialacademy.entity.Class;
import com.coaxialacademy.entity.ClassSubject;
import com.coaxialacademy.entity.Subject;
import com.coaxialacademy.entity.User;
import com.coaxialacademy.repository.ClassRepository;
import com.coaxialacademy.repository.ClassSubjectRepository;
import com.coaxialacademy.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClassSubjectService {
    
    @Autowired
    private ClassSubjectRepository classSubjectRepository;
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    // Add subject to class
    public ClassSubjectResponse addSubjectToClass(ClassSubjectRequest request) {
        // Validate class exists
        Class classEntity = classRepository.findById(request.getClassId())
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        // Validate subject exists
        Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        
        // Check if relationship already exists
        if (classSubjectRepository.existsByClassEntityAndSubject(classEntity, subject)) {
            throw new IllegalArgumentException("Subject is already assigned to this class");
        }
        
        ClassSubject classSubject = new ClassSubject();
        classSubject.setClassEntity(classEntity);
        classSubject.setSubject(subject);
        classSubject.setDisplayOrder(request.getDisplayOrder());
        classSubject.setIsActive(request.getIsActive());
        classSubject.setCreatedBy(getCurrentUser());
        
        ClassSubject savedClassSubject = classSubjectRepository.save(classSubject);
        return convertToResponse(savedClassSubject);
    }
    
    // Get subjects for class
    @Transactional(readOnly = true)
    public List<ClassSubjectResponse> getSubjectsForClass(Long classId) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        
        List<ClassSubject> classSubjects = classSubjectRepository.findActiveSubjectsForClass(classId);
        return classSubjects.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Get classes for subject
    @Transactional(readOnly = true)
    public List<ClassSubjectResponse> getClassesForSubject(Long subjectId) {
        List<ClassSubject> classSubjects = classSubjectRepository.findActiveClassesForSubject(subjectId);
        return classSubjects.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Update class-subject relationship
    public ClassSubjectResponse updateClassSubject(Long id, ClassSubjectRequest request) {
        ClassSubject classSubject = classSubjectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Class-Subject relationship not found"));
        
        // Update fields
        classSubject.setDisplayOrder(request.getDisplayOrder());
        classSubject.setIsActive(request.getIsActive());
        classSubject.setUpdatedBy(getCurrentUser());
        
        ClassSubject updatedClassSubject = classSubjectRepository.save(classSubject);
        return convertToResponse(updatedClassSubject);
    }
    
    // Remove subject from class
    public void removeSubjectFromClass(Long id) {
        if (!classSubjectRepository.existsById(id)) {
            throw new IllegalArgumentException("Class-Subject relationship not found");
        }
        classSubjectRepository.deleteById(id);
    }
    
    // Convert ClassSubject entity to ClassSubjectResponse DTO
    private ClassSubjectResponse convertToResponse(ClassSubject classSubject) {
        ClassSubjectResponse response = new ClassSubjectResponse();
        response.setId(classSubject.getId());
        response.setClassId(classSubject.getClassEntity().getId());
        response.setClassName(classSubject.getClassEntity().getName());
        response.setSubjectId(classSubject.getSubject().getId());
        response.setSubjectName(classSubject.getSubject().getName());
        response.setDisplayOrder(classSubject.getDisplayOrder());
        response.setIsActive(classSubject.getIsActive());
        response.setCreatedAt(classSubject.getCreatedAt());
        response.setUpdatedAt(classSubject.getUpdatedAt());
        
        if (classSubject.getCreatedBy() != null) {
            response.setCreatedByName(classSubject.getCreatedBy().getFullName());
        }
        if (classSubject.getUpdatedBy() != null) {
            response.setUpdatedByName(classSubject.getUpdatedBy().getFullName());
        }
        
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

### ClassController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.ClassRequest;
import com.coaxialacademy.dto.response.ClassResponse;
import com.coaxialacademy.service.ClassService;
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
@RequestMapping("/api/admin/master-data/classes")
@PreAuthorize("hasRole('ADMIN')")
public class ClassController {
    
    @Autowired
    private ClassService classService;
    
    // Get all classes with filters and pagination
    @GetMapping
    public ResponseEntity<Page<ClassResponse>> getClasses(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ClassResponse> classes = classService.getClasses(courseId, isActive, search, pageable);
        return ResponseEntity.ok(classes);
    }
    
    // Get all classes without pagination
    @GetMapping("/all")
    public ResponseEntity<List<ClassResponse>> getAllClasses(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search) {
        
        List<ClassResponse> classes = classService.getAllClasses(courseId, isActive, search);
        return ResponseEntity.ok(classes);
    }
    
    // Get class by ID
    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable Long id) {
        ClassResponse classEntity = classService.getClassById(id);
        return ResponseEntity.ok(classEntity);
    }
    
    // Get classes by course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ClassResponse>> getClassesByCourse(@PathVariable Long courseId) {
        List<ClassResponse> classes = classService.getClassesByCourse(courseId);
        return ResponseEntity.ok(classes);
    }
    
    // Create new class
    @PostMapping
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody ClassRequest classRequest) {
        ClassResponse classEntity = classService.createClass(classRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(classEntity);
    }
    
    // Update class
    @PutMapping("/{id}")
    public ResponseEntity<ClassResponse> updateClass(@PathVariable Long id, 
                                                    @Valid @RequestBody ClassRequest classRequest) {
        ClassResponse classEntity = classService.updateClass(id, classRequest);
        return ResponseEntity.ok(classEntity);
    }
    
    // Delete class
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Class deleted successfully");
        return ResponseEntity.ok(response);
    }
}
```

### ClassSubjectController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.ClassSubjectRequest;
import com.coaxialacademy.dto.response.ClassSubjectResponse;
import com.coaxialacademy.service.ClassSubjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/master-data/class-subjects")
@PreAuthorize("hasRole('ADMIN')")
public class ClassSubjectController {
    
    @Autowired
    private ClassSubjectService classSubjectService;
    
    // Add subject to class
    @PostMapping
    public ResponseEntity<ClassSubjectResponse> addSubjectToClass(@Valid @RequestBody ClassSubjectRequest request) {
        ClassSubjectResponse classSubject = classSubjectService.addSubjectToClass(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(classSubject);
    }
    
    // Get subjects for class
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ClassSubjectResponse>> getSubjectsForClass(@PathVariable Long classId) {
        List<ClassSubjectResponse> subjects = classSubjectService.getSubjectsForClass(classId);
        return ResponseEntity.ok(subjects);
    }
    
    // Get classes for subject
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<ClassSubjectResponse>> getClassesForSubject(@PathVariable Long subjectId) {
        List<ClassSubjectResponse> classes = classSubjectService.getClassesForSubject(subjectId);
        return ResponseEntity.ok(classes);
    }
    
    // Update class-subject relationship
    @PutMapping("/{id}")
    public ResponseEntity<ClassSubjectResponse> updateClassSubject(@PathVariable Long id, 
                                                                  @Valid @RequestBody ClassSubjectRequest request) {
        ClassSubjectResponse classSubject = classSubjectService.updateClassSubject(id, request);
        return ResponseEntity.ok(classSubject);
    }
    
    // Remove subject from class
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeSubjectFromClass(@PathVariable Long id) {
        classSubjectService.removeSubjectFromClass(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Subject removed from class successfully");
        return ResponseEntity.ok(response);
    }
}
```

## API Endpoints Summary

### Class Management Endpoints
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/master-data/classes` | Get all classes with filters and pagination | ADMIN |
| GET | `/api/admin/master-data/classes/all` | Get all classes without pagination | ADMIN |
| GET | `/api/admin/master-data/classes/{id}` | Get class by ID | ADMIN |
| GET | `/api/admin/master-data/classes/course/{courseId}` | Get classes by course | ADMIN |
| POST | `/api/admin/master-data/classes` | Create new class | ADMIN |
| PUT | `/api/admin/master-data/classes/{id}` | Update class | ADMIN |
| DELETE | `/api/admin/master-data/classes/{id}` | Delete class | ADMIN |

### Class-Subject Relationship Endpoints
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/admin/master-data/class-subjects` | Add subject to class | ADMIN |
| GET | `/api/admin/master-data/class-subjects/class/{classId}` | Get subjects for class | ADMIN |
| GET | `/api/admin/master-data/class-subjects/subject/{subjectId}` | Get classes for subject | ADMIN |
| PUT | `/api/admin/master-data/class-subjects/{id}` | Update class-subject relationship | ADMIN |
| DELETE | `/api/admin/master-data/class-subjects/{id}` | Remove subject from class | ADMIN |

## Request/Response Examples

### Create Class Request
```json
POST /api/admin/master-data/classes
{
  "name": "Class 10",
  "description": "Tenth standard class for academic year 2024-25",
  "courseId": 1,
  "displayOrder": 1,
  "isActive": true
}
```

### Class Response
```json
{
  "id": 1,
  "name": "Class 10",
  "description": "Tenth standard class for academic year 2024-25",
  "courseId": 1,
  "courseName": "Mathematics Foundation",
  "courseTypeName": "Academic",
  "structureType": "ACADEMIC",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdByName": "John Doe",
  "updatedByName": null,
  "subjects": [],
  "subjectCount": 0
}
```

### Add Subject to Class Request
```json
POST /api/admin/master-data/class-subjects
{
  "classId": 1,
  "subjectId": 1,
  "displayOrder": 1,
  "isActive": true
}
```

### Class-Subject Response
```json
{
  "id": 1,
  "classId": 1,
  "className": "Class 10",
  "subjectId": 1,
  "subjectName": "Mathematics",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdByName": "John Doe",
  "updatedByName": null
}
```

## Implementation Notes

### Academic Course Structure Support
- **Hierarchical Flow**: CourseType (Academic) → Course → Class → Subject → Topic → Module → Chapter
- **Class Management**: Classes are specific to Academic course types
- **Subject Assignment**: Many-to-many relationship between classes and subjects
- **Display Ordering**: Custom ordering within courses and for subject assignments

### Key Features
- **Course Integration**: Classes are always associated with a course
- **Subject Management**: Flexible assignment of subjects to classes
- **Validation**: Ensures unique class names within each course
- **Audit Trail**: Tracks creation and modification by users
- **Flexible Filtering**: Filter by course, active status, and search terms
- **Display Ordering**: Support for custom ordering of classes and subjects
- **Relationship Management**: Complete CRUD for class-subject relationships

### Database Design
- **Junction Table**: ClassSubject entity for many-to-many relationship
- **Cascade Operations**: Proper cascade settings for data integrity
- **Indexing**: Optimized indexes for performance
- **Constraints**: Unique constraints to prevent duplicate relationships

This implementation provides a complete, production-ready Class Management API specifically designed for Academic course structures! 🚀
