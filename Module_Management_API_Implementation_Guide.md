# Module Management API Implementation Guide

## Overview
This guide provides a complete implementation for Module Management API in Spring Boot, with hierarchical filtering based on course types and conditional form fields.

## Database Schema

### Modules Table
```sql
CREATE TABLE modules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    topic_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_name (name),
    INDEX idx_topic_id (topic_id),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);
```

## Entity Classes

### Module Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "modules")
public class Module {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Module name is required")
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Topic is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;
    
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
    public Module() {}
    
    public Module(String name, String description, Topic topic) {
        this.name = name;
        this.description = description;
        this.topic = topic;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
    
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

### ModuleRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class ModuleRequestDTO {
    
    @NotBlank(message = "Module name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Topic ID is required")
    private Long topicId;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    // Constructors
    public ModuleRequestDTO() {}
    
    public ModuleRequestDTO(String name, String description, Long topicId) {
        this.name = name;
        this.description = description;
        this.topicId = topicId;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### ModuleResponseDTO
```java
package com.coaxialacademy.dto.response;

import com.coaxialacademy.entity.Module;

public class ModuleResponseDTO {
    
    private Long id;
    private String name;
    private String description;
    private Long topicId;
    private String topicName;
    private Long subjectId;
    private String subjectName;
    private String subjectType;
    private Integer displayOrder;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
    
    // Constructors
    public ModuleResponseDTO() {}
    
    public ModuleResponseDTO(Module module) {
        this.id = module.getId();
        this.name = module.getName();
        this.description = module.getDescription();
        this.topicId = module.getTopic().getId();
        this.topicName = module.getTopic().getName();
        this.subjectId = module.getTopic().getSubject().getId();
        this.subjectName = module.getTopic().getSubject().getName();
        this.subjectType = module.getTopic().getSubject().getSubjectType().toString();
        this.displayOrder = module.getDisplayOrder();
        this.isActive = module.getIsActive();
        this.createdAt = module.getCreatedAt() != null ? module.getCreatedAt().toString() : null;
        this.updatedAt = module.getUpdatedAt() != null ? module.getUpdatedAt().toString() : null;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }
    
    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }
    
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

### ModuleRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    
    List<Module> findByTopicIdAndIsActiveTrueOrderByDisplayOrderAsc(Long topicId);
    
    List<Module> findByTopicIdOrderByDisplayOrderAsc(Long topicId);
    
    @Query("SELECT m FROM Module m WHERE m.topic.id = :topicId AND m.isActive = :isActive ORDER BY m.displayOrder ASC")
    List<Module> findByTopicIdAndIsActiveOrderByDisplayOrderAsc(@Param("topicId") Long topicId, @Param("isActive") Boolean isActive);
    
    @Query("SELECT m FROM Module m WHERE m.topic.id IN :topicIds AND m.isActive = true ORDER BY m.displayOrder ASC")
    List<Module> findByTopicIdInAndIsActiveTrueOrderByDisplayOrderAsc(@Param("topicIds") List<Long> topicIds);
    
    @Query("SELECT m FROM Module m WHERE m.name LIKE %:name% AND m.isActive = true ORDER BY m.displayOrder ASC")
    List<Module> findByNameContainingAndIsActiveTrueOrderByDisplayOrderAsc(@Param("name") String name);
    
    @Query("SELECT m FROM Module m WHERE m.topic.subject.subjectType = :subjectType AND m.isActive = true ORDER BY m.displayOrder ASC")
    List<Module> findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(@Param("subjectType") String subjectType);
    
    @Query("SELECT m FROM Module m WHERE m.createdAt >= :createdAfter AND m.isActive = true ORDER BY m.displayOrder ASC")
    List<Module> findByCreatedAtAfterAndIsActiveTrueOrderByDisplayOrderAsc(@Param("createdAfter") LocalDateTime createdAfter);
    
    @Query("SELECT m FROM Module m WHERE m.topic.subject.courseType.id = :courseTypeId AND m.isActive = true ORDER BY m.displayOrder ASC")
    List<Module> findByCourseTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(@Param("courseTypeId") Long courseTypeId);
    
    Optional<Module> findByNameAndTopicId(String name, Long topicId);
    
    boolean existsByNameAndTopicId(String name, Long topicId);
    
    boolean existsByNameAndTopicIdAndIdNot(String name, Long topicId, Long id);
}
```

## Service Layer

### ModuleService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.ModuleRequestDTO;
import com.coaxialacademy.dto.response.ModuleResponseDTO;
import com.coaxialacademy.entity.Module;
import com.coaxialacademy.entity.Topic;
import com.coaxialacademy.repository.ModuleRepository;
import com.coaxialacademy.repository.TopicRepository;
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
public class ModuleService {
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    @Autowired
    private TopicRepository topicRepository;
    
    public List<ModuleResponseDTO> getAllModules() {
        return moduleRepository.findAll().stream()
                .map(ModuleResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<ModuleResponseDTO> getModulesByTopicId(Long topicId) {
        return moduleRepository.findByTopicIdAndIsActiveTrueOrderByDisplayOrderAsc(topicId).stream()
                .map(ModuleResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<ModuleResponseDTO> getModulesByTopicIds(List<Long> topicIds) {
        return moduleRepository.findByTopicIdInAndIsActiveTrueOrderByDisplayOrderAsc(topicIds).stream()
                .map(ModuleResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<ModuleResponseDTO> getModulesWithFilters(Boolean isActive, String name, Long topicId, Long subjectId, Long courseTypeId, LocalDateTime createdAfter) {
        List<Module> modules;
        
        if (topicId != null) {
            modules = moduleRepository.findByTopicIdAndIsActiveOrderByDisplayOrderAsc(topicId, isActive);
        } else if (subjectId != null) {
            modules = moduleRepository.findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(subjectId.toString());
        } else if (courseTypeId != null) {
            modules = moduleRepository.findByCourseTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(courseTypeId);
        } else if (name != null && !name.trim().isEmpty()) {
            modules = moduleRepository.findByNameContainingAndIsActiveTrueOrderByDisplayOrderAsc(name);
        } else if (createdAfter != null) {
            modules = moduleRepository.findByCreatedAtAfterAndIsActiveTrueOrderByDisplayOrderAsc(createdAfter);
        } else {
            modules = moduleRepository.findAll();
        }
        
        return modules.stream()
                .map(ModuleResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public Page<ModuleResponseDTO> getModulesPaginated(Pageable pageable) {
        return moduleRepository.findAll(pageable)
                .map(ModuleResponseDTO::new);
    }
    
    public Optional<ModuleResponseDTO> getModuleById(Long id) {
        return moduleRepository.findById(id)
                .map(ModuleResponseDTO::new);
    }
    
    public ModuleResponseDTO createModule(ModuleRequestDTO moduleRequestDTO) {
        // Validate topic exists
        Topic topic = topicRepository.findById(moduleRequestDTO.getTopicId())
                .orElseThrow(() -> new IllegalArgumentException("Topic not found with ID: " + moduleRequestDTO.getTopicId()));
        
        // Check for duplicate name within the same topic
        if (moduleRepository.existsByNameAndTopicId(moduleRequestDTO.getName(), moduleRequestDTO.getTopicId())) {
            throw new IllegalArgumentException("Module with name '" + moduleRequestDTO.getName() + "' already exists for this topic");
        }
        
        Module module = new Module();
        module.setName(moduleRequestDTO.getName());
        module.setDescription(moduleRequestDTO.getDescription());
        module.setTopic(topic);
        module.setDisplayOrder(moduleRequestDTO.getDisplayOrder());
        module.setIsActive(moduleRequestDTO.getIsActive());
        
        Module savedModule = moduleRepository.save(module);
        return new ModuleResponseDTO(savedModule);
    }
    
    public ModuleResponseDTO updateModule(Long id, ModuleRequestDTO moduleRequestDTO) {
        Module existingModule = moduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Module not found with ID: " + id));
        
        // Validate topic exists
        Topic topic = topicRepository.findById(moduleRequestDTO.getTopicId())
                .orElseThrow(() -> new IllegalArgumentException("Topic not found with ID: " + moduleRequestDTO.getTopicId()));
        
        // Check for duplicate name within the same topic (excluding current module)
        if (moduleRepository.existsByNameAndTopicIdAndIdNot(moduleRequestDTO.getName(), moduleRequestDTO.getTopicId(), id)) {
            throw new IllegalArgumentException("Module with name '" + moduleRequestDTO.getName() + "' already exists for this topic");
        }
        
        existingModule.setName(moduleRequestDTO.getName());
        existingModule.setDescription(moduleRequestDTO.getDescription());
        existingModule.setTopic(topic);
        existingModule.setDisplayOrder(moduleRequestDTO.getDisplayOrder());
        existingModule.setIsActive(moduleRequestDTO.getIsActive());
        
        Module updatedModule = moduleRepository.save(existingModule);
        return new ModuleResponseDTO(updatedModule);
    }
    
    public void deleteModule(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new IllegalArgumentException("Module not found with ID: " + id);
        }
        moduleRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return moduleRepository.existsById(id);
    }
}
```

## Controller Layer

### ModuleController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.ModuleRequestDTO;
import com.coaxialacademy.dto.response.ModuleResponseDTO;
import com.coaxialacademy.service.ModuleService;
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
@RequestMapping("/api/admin/master-data/modules")
@CrossOrigin(origins = "*")
public class ModuleController {
    
    @Autowired
    private ModuleService moduleService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ModuleResponseDTO>> getAllModules() {
        List<ModuleResponseDTO> modules = moduleService.getAllModules();
        return ResponseEntity.ok(modules);
    }
    
    @GetMapping("/topic/{topicId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ModuleResponseDTO>> getModulesByTopicId(@PathVariable Long topicId) {
        List<ModuleResponseDTO> modules = moduleService.getModulesByTopicId(topicId);
        return ResponseEntity.ok(modules);
    }
    
    @GetMapping("/filtered")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ModuleResponseDTO>> getModulesWithFilters(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long topicId,
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
        
        List<ModuleResponseDTO> modules = moduleService.getModulesWithFilters(active, name, topicId, subjectId, courseTypeId, createdAfterDate);
        return ResponseEntity.ok(modules);
    }
    
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Page<ModuleResponseDTO>> getModulesPaginated(Pageable pageable) {
        Page<ModuleResponseDTO> modules = moduleService.getModulesPaginated(pageable);
        return ResponseEntity.ok(modules);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ModuleResponseDTO> getModuleById(@PathVariable Long id) {
        Optional<ModuleResponseDTO> module = moduleService.getModuleById(id);
        return module.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModuleResponseDTO> createModule(@Valid @RequestBody ModuleRequestDTO moduleRequestDTO) {
        try {
            ModuleResponseDTO createdModule = moduleService.createModule(moduleRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdModule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModuleResponseDTO> updateModule(@PathVariable Long id, @Valid @RequestBody ModuleRequestDTO moduleRequestDTO) {
        try {
            ModuleResponseDTO updatedModule = moduleService.updateModule(id, moduleRequestDTO);
            return ResponseEntity.ok(updatedModule);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        try {
            moduleService.deleteModule(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

## API Endpoints

### Module Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/master-data/modules` | Get all modules | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/modules/topic/{topicId}` | Get modules by topic ID | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/modules/filtered` | Get modules with filters | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/modules/paginated` | Get paginated modules | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/modules/{id}` | Get module by ID | ADMIN, INSTRUCTOR |
| POST | `/api/admin/master-data/modules` | Create new module | ADMIN |
| PUT | `/api/admin/master-data/modules/{id}` | Update module | ADMIN |
| DELETE | `/api/admin/master-data/modules/{id}` | Delete module | ADMIN |

## Request/Response Examples

### Create Module
```json
POST /api/admin/master-data/modules
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Basic Addition Concepts",
  "description": "Introduction to addition with examples and exercises",
  "topicId": 1,
  "displayOrder": 1,
  "isActive": true
}

Response:
{
  "id": 1,
  "name": "Basic Addition Concepts",
  "description": "Introduction to addition with examples and exercises",
  "topicId": 1,
  "topicName": "Addition of Two Numbers",
  "subjectId": 1,
  "subjectName": "Mathematics",
  "subjectType": "ACADEMIC",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Get Modules with Filters
```json
GET /api/admin/master-data/modules/filtered?active=true&name=addition&topicId=1

Response:
[
  {
    "id": 1,
    "name": "Basic Addition Concepts",
    "description": "Introduction to addition with examples and exercises",
    "topicId": 1,
    "topicName": "Addition of Two Numbers",
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

### Get Modules by Topic
```json
GET /api/admin/master-data/modules/topic/1

Response:
[
  {
    "id": 1,
    "name": "Basic Addition Concepts",
    "description": "Introduction to addition with examples and exercises",
    "topicId": 1,
    "topicName": "Addition of Two Numbers",
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
    "name": "Advanced Addition Techniques",
    "description": "Advanced addition methods and problem solving",
    "topicId": 1,
    "topicName": "Addition of Two Numbers",
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

This implementation provides a complete Module management system that aligns with the existing frontend form structure and supports hierarchical filtering! 🚀
