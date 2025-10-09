# Topic Management API Implementation Guide

## Overview
This guide provides a complete implementation for Topic Management API in Spring Boot, with hierarchical filtering based on course types and conditional form fields.

## Database Schema

### Topics Table
```sql
CREATE TABLE topics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_name (name),
    INDEX idx_subject_id (subject_id),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
```

## Entity Classes

### Topic Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "topics")
public class Topic {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Topic name is required")
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Subject is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
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
    
    // Constructors
    public Topic() {}
    
    public Topic(String name, String description, Subject subject) {
        this.name = name;
        this.description = description;
        this.subject = subject;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
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
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
```

## DTOs

### TopicRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class TopicRequestDTO {
    
    @NotBlank(message = "Topic name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public TopicRequestDTO() {}
    
    public TopicRequestDTO(String name, String description, Long subjectId) {
        this.name = name;
        this.description = description;
        this.subjectId = subjectId;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### TopicResponseDTO
```java
package com.coaxialacademy.dto.response;

import com.coaxialacademy.entity.Topic;

public class TopicResponseDTO {
    
    private Long id;
    private String name;
    private String description;
    private Long subjectId;
    private String subjectName;
    private String subjectType;
    private Integer displayOrder;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
    
    // Constructors
    public TopicResponseDTO() {}
    
    public TopicResponseDTO(Topic topic) {
        this.id = topic.getId();
        this.name = topic.getName();
        this.description = topic.getDescription();
        this.subjectId = topic.getSubject().getId();
        this.subjectName = topic.getSubject().getName();
        this.subjectType = topic.getSubject().getSubjectType().toString();
        this.displayOrder = topic.getDisplayOrder();
        this.isActive = topic.getIsActive();
        this.createdAt = topic.getCreatedAt() != null ? topic.getCreatedAt().toString() : null;
        this.updatedAt = topic.getUpdatedAt() != null ? topic.getUpdatedAt().toString() : null;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    
    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
```

## Repository Layer

### TopicRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    List<Topic> findBySubjectIdAndIsActiveTrueOrderByDisplayOrderAsc(Long subjectId);
    
    List<Topic> findBySubjectIdOrderByDisplayOrderAsc(Long subjectId);
    
    @Query("SELECT t FROM Topic t WHERE t.subject.id = :subjectId AND t.isActive = :isActive ORDER BY t.displayOrder ASC")
    List<Topic> findBySubjectIdAndIsActiveOrderByDisplayOrderAsc(@Param("subjectId") Long subjectId, @Param("isActive") Boolean isActive);
    
    @Query("SELECT t FROM Topic t WHERE t.subject.id IN :subjectIds AND t.isActive = true ORDER BY t.displayOrder ASC")
    List<Topic> findBySubjectIdInAndIsActiveTrueOrderByDisplayOrderAsc(@Param("subjectIds") List<Long> subjectIds);
    
    @Query("SELECT t FROM Topic t WHERE t.name LIKE %:name% AND t.isActive = true ORDER BY t.displayOrder ASC")
    List<Topic> findByNameContainingAndIsActiveTrueOrderByDisplayOrderAsc(@Param("name") String name);
    
    @Query("SELECT t FROM Topic t WHERE t.subject.subjectType = :subjectType AND t.isActive = true ORDER BY t.displayOrder ASC")
    List<Topic> findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(@Param("subjectType") String subjectType);
    
    @Query("SELECT t FROM Topic t WHERE t.createdAt >= :createdAfter AND t.isActive = true ORDER BY t.displayOrder ASC")
    List<Topic> findByCreatedAtAfterAndIsActiveTrueOrderByDisplayOrderAsc(@Param("createdAfter") LocalDateTime createdAfter);
    
    @Query("SELECT t FROM Topic t WHERE t.subject.courseType.id = :courseTypeId AND t.isActive = true ORDER BY t.displayOrder ASC")
    List<Topic> findByCourseTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(@Param("courseTypeId") Long courseTypeId);
    
    Optional<Topic> findByNameAndSubjectId(String name, Long subjectId);
    
    boolean existsByNameAndSubjectId(String name, Long subjectId);
    
    boolean existsByNameAndSubjectIdAndIdNot(String name, Long subjectId, Long id);
}
```

## Service Layer

### TopicService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.TopicRequestDTO;
import com.coaxialacademy.dto.response.TopicResponseDTO;
import com.coaxialacademy.entity.Topic;
import com.coaxialacademy.entity.Subject;
import com.coaxialacademy.repository.TopicRepository;
import com.coaxialacademy.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicService {
    
    @Autowired
    private TopicRepository topicRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    public List<TopicResponseDTO> getAllTopics() {
        return topicRepository.findAll().stream()
                .map(TopicResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<TopicResponseDTO> getTopicsBySubjectId(Long subjectId) {
        return topicRepository.findBySubjectIdAndIsActiveTrueOrderByDisplayOrderAsc(subjectId).stream()
                .map(TopicResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<TopicResponseDTO> getTopicsBySubjectIds(List<Long> subjectIds) {
        return topicRepository.findBySubjectIdInAndIsActiveTrueOrderByDisplayOrderAsc(subjectIds).stream()
                .map(TopicResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<TopicResponseDTO> getTopicsWithFilters(Boolean isActive, String name, Long subjectId, Long courseTypeId, LocalDateTime createdAfter) {
        List<Topic> topics;
        
        if (subjectId != null) {
            topics = topicRepository.findBySubjectIdAndIsActiveOrderByDisplayOrderAsc(subjectId, isActive);
        } else if (courseTypeId != null) {
            topics = topicRepository.findByCourseTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(courseTypeId);
        } else if (name != null && !name.trim().isEmpty()) {
            topics = topicRepository.findByNameContainingAndIsActiveTrueOrderByDisplayOrderAsc(name);
        } else if (createdAfter != null) {
            topics = topicRepository.findByCreatedAtAfterAndIsActiveTrueOrderByDisplayOrderAsc(createdAfter);
        } else {
            topics = topicRepository.findAll();
        }
        
        return topics.stream()
                .map(TopicResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public Page<TopicResponseDTO> getTopicsPaginated(Pageable pageable) {
        return topicRepository.findAll(pageable)
                .map(TopicResponseDTO::new);
    }
    
    public Optional<TopicResponseDTO> getTopicById(Long id) {
        return topicRepository.findById(id)
                .map(TopicResponseDTO::new);
    }
    
    public TopicResponseDTO createTopic(TopicRequestDTO topicRequestDTO) {
        // Validate subject exists
        Subject subject = subjectRepository.findById(topicRequestDTO.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + topicRequestDTO.getSubjectId()));
        
        // Check for duplicate name within the same subject
        if (topicRepository.existsByNameAndSubjectId(topicRequestDTO.getName(), topicRequestDTO.getSubjectId())) {
            throw new IllegalArgumentException("Topic with name '" + topicRequestDTO.getName() + "' already exists for this subject");
        }
        
        Topic topic = new Topic();
        topic.setName(topicRequestDTO.getName());
        topic.setDescription(topicRequestDTO.getDescription());
        topic.setSubject(subject);
        topic.setDisplayOrder(topicRequestDTO.getDisplayOrder());
        topic.setIsActive(topicRequestDTO.getIsActive());
        
        Topic savedTopic = topicRepository.save(topic);
        return new TopicResponseDTO(savedTopic);
    }
    
    public TopicResponseDTO updateTopic(Long id, TopicRequestDTO topicRequestDTO) {
        Topic existingTopic = topicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found with ID: " + id));
        
        // Validate subject exists
        Subject subject = subjectRepository.findById(topicRequestDTO.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + topicRequestDTO.getSubjectId()));
        
        // Check for duplicate name within the same subject (excluding current topic)
        if (topicRepository.existsByNameAndSubjectIdAndIdNot(topicRequestDTO.getName(), topicRequestDTO.getSubjectId(), id)) {
            throw new IllegalArgumentException("Topic with name '" + topicRequestDTO.getName() + "' already exists for this subject");
        }
        
        existingTopic.setName(topicRequestDTO.getName());
        existingTopic.setDescription(topicRequestDTO.getDescription());
        existingTopic.setSubject(subject);
        existingTopic.setDisplayOrder(topicRequestDTO.getDisplayOrder());
        existingTopic.setIsActive(topicRequestDTO.getIsActive());
        
        Topic updatedTopic = topicRepository.save(existingTopic);
        return new TopicResponseDTO(updatedTopic);
    }
    
    public void deleteTopic(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new IllegalArgumentException("Topic not found with ID: " + id);
        }
        topicRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return topicRepository.existsById(id);
    }
}
```

## Controller Layer

### TopicController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.TopicRequestDTO;
import com.coaxialacademy.dto.response.TopicResponseDTO;
import com.coaxialacademy.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/master-data/topics")
@CrossOrigin(origins = "*")
public class TopicController {
    
    @Autowired
    private TopicService topicService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<TopicResponseDTO>> getAllTopics() {
        List<TopicResponseDTO> topics = topicService.getAllTopics();
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<TopicResponseDTO>> getTopicsBySubjectId(@PathVariable Long subjectId) {
        List<TopicResponseDTO> topics = topicService.getTopicsBySubjectId(subjectId);
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/filtered")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<TopicResponseDTO>> getTopicsWithFilters(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long courseTypeId,
            @RequestParam(required = false) String createdAfter) {
        
        LocalDateTime createdAfterDate = null;
        if (createdAfter != null && !createdAfter.trim().isEmpty()) {
            try {
                createdAfterDate = LocalDateTime.parse(createdAfter);
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        List<TopicResponseDTO> topics = topicService.getTopicsWithFilters(active, name, subjectId, courseTypeId, createdAfterDate);
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Page<TopicResponseDTO>> getTopicsPaginated(Pageable pageable) {
        Page<TopicResponseDTO> topics = topicService.getTopicsPaginated(pageable);
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<TopicResponseDTO> getTopicById(@PathVariable Long id) {
        Optional<TopicResponseDTO> topic = topicService.getTopicById(id);
        return topic.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopicResponseDTO> createTopic(@Valid @RequestBody TopicRequestDTO topicRequestDTO) {
        try {
            TopicResponseDTO createdTopic = topicService.createTopic(topicRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTopic);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopicResponseDTO> updateTopic(@PathVariable Long id, @Valid @RequestBody TopicRequestDTO topicRequestDTO) {
        try {
            TopicResponseDTO updatedTopic = topicService.updateTopic(id, topicRequestDTO);
            return ResponseEntity.ok(updatedTopic);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        try {
            topicService.deleteTopic(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

## API Endpoints

### Topic Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/master-data/topics` | Get all topics | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/topics/subject/{subjectId}` | Get topics by subject ID | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/topics/filtered` | Get topics with filters | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/topics/paginated` | Get paginated topics | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/topics/{id}` | Get topic by ID | ADMIN, INSTRUCTOR |
| POST | `/api/admin/master-data/topics` | Create new topic | ADMIN |
| PUT | `/api/admin/master-data/topics/{id}` | Update topic | ADMIN |
| DELETE | `/api/admin/master-data/topics/{id}` | Delete topic | ADMIN |

## Request/Response Examples

### Create Topic
```json
POST /api/admin/master-data/topics
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Addition of Two Numbers",
  "description": "Basic addition concepts with examples",
  "subjectId": 1,
  "displayOrder": 1,
  "isActive": true
}

Response:
{
  "id": 1,
  "name": "Addition of Two Numbers",
  "description": "Basic addition concepts with examples",
  "subjectId": 1,
  "subjectName": "Mathematics",
  "subjectType": "ACADEMIC",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Get Topics with Filters
```json
GET /api/admin/master-data/topics/filtered?active=true&name=addition&subjectId=1

Response:
[
  {
    "id": 1,
    "name": "Addition of Two Numbers",
    "description": "Basic addition concepts with examples",
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": "ACADEMIC",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

### Get Topics by Subject
```json
GET /api/admin/master-data/topics/subject/1

Response:
[
  {
    "id": 1,
    "name": "Addition of Two Numbers",
    "description": "Basic addition concepts with examples",
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": "ACADEMIC",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Subtraction of Two Numbers",
    "description": "Basic subtraction concepts with examples",
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": "ACADEMIC",
    "displayOrder": 2,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

This implementation provides a complete Topic management system that aligns with the existing frontend form structure and supports hierarchical filtering! 🚀
