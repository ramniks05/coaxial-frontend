# Chapter Management API Implementation Guide

## Overview
This guide provides a complete implementation for Chapter Management API in Spring Boot, with hierarchical filtering based on course types and conditional form fields.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Entity Classes](#entity-classes)
3. [DTOs](#dtos)
4. [Repository Layer](#repository-layer)
5. [Service Layer](#service-layer)
6. [Controller Layer](#controller-layer)
7. [API Endpoints](#api-endpoints)
8. [Request/Response Examples](#requestresponse-examples)
9. [Error Handling](#error-handling)

## Database Schema

```sql
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    module_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    INDEX idx_name (name),
    INDEX idx_module_id (module_id),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Chapter YouTube links (one-to-many)
CREATE TABLE chapter_youtube_links (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chapter_id BIGINT NOT NULL,
    youtube_link VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Chapter uploaded files (one-to-many)
CREATE TABLE chapter_uploaded_files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chapter_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
```

## Entity Classes

### Chapter Entity
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
@Table(name = "chapters")
public class Chapter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Chapter name is required")
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotNull(message = "Module is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;
    
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
    
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChapterYoutubeLink> youtubeLinks = new ArrayList<>();
    
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChapterUploadedFile> uploadedFiles = new ArrayList<>();
    
    // Constructors
    public Chapter() {}
    
    public Chapter(String name, String description, Module module) {
        this.name = name;
        this.description = description;
        this.module = module;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Module getModule() { return module; }
    public void setModule(Module module) { this.module = module; }
    
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
    
    public List<ChapterYoutubeLink> getYoutubeLinks() { return youtubeLinks; }
    public void setYoutubeLinks(List<ChapterYoutubeLink> youtubeLinks) { this.youtubeLinks = youtubeLinks; }
    
    public List<ChapterUploadedFile> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<ChapterUploadedFile> uploadedFiles) { this.uploadedFiles = uploadedFiles; }
}
```

### ChapterYoutubeLink Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chapter_youtube_links")
public class ChapterYoutubeLink {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;
    
    @NotBlank(message = "YouTube link is required")
    @Column(name = "youtube_link", nullable = false, length = 500)
    private String youtubeLink;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public ChapterYoutubeLink() {}
    
    public ChapterYoutubeLink(Chapter chapter, String youtubeLink) {
        this.chapter = chapter;
        this.youtubeLink = youtubeLink;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Chapter getChapter() { return chapter; }
    public void setChapter(Chapter chapter) { this.chapter = chapter; }
    
    public String getYoutubeLink() { return youtubeLink; }
    public void setYoutubeLink(String youtubeLink) { this.youtubeLink = youtubeLink; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

### ChapterUploadedFile Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chapter_uploaded_files")
public class ChapterUploadedFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;
    
    @NotBlank(message = "File name is required")
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;
    
    @Column(name = "file_path", length = 500)
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_type", length = 100)
    private String fileType;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public ChapterUploadedFile() {}
    
    public ChapterUploadedFile(Chapter chapter, String fileName) {
        this.chapter = chapter;
        this.fileName = fileName;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Chapter getChapter() { return chapter; }
    public void setChapter(Chapter chapter) { this.chapter = chapter; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

## DTOs

### ChapterRequestDTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

public class ChapterRequestDTO {
    
    @NotBlank(message = "Chapter name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Module ID is required")
    private Long moduleId;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
    
    private Boolean isActive = true;
    
    private List<String> youtubeLinks;
    private List<String> uploadedFiles;
    
    // Constructors
    public ChapterRequestDTO() {}
    
    public ChapterRequestDTO(String name, String description, Long moduleId) {
        this.name = name;
        this.description = description;
        this.moduleId = moduleId;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public List<String> getYoutubeLinks() { return youtubeLinks; }
    public void setYoutubeLinks(List<String> youtubeLinks) { this.youtubeLinks = youtubeLinks; }
    
    public List<String> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<String> uploadedFiles) { this.uploadedFiles = uploadedFiles; }
}
```

### ChapterResponseDTO
```java
package com.coaxialacademy.dto.response;

import com.coaxialacademy.entity.Chapter;
import java.util.List;
import java.util.stream.Collectors;

public class ChapterResponseDTO {
    
    private Long id;
    private String name;
    private String description;
    private Long moduleId;
    private String moduleName;
    private Long topicId;
    private String topicName;
    private Long subjectId;
    private String subjectName;
    private String subjectType;
    private Integer displayOrder;
    private Boolean isActive;
    private List<String> youtubeLinks;
    private List<String> uploadedFiles;
    private String createdAt;
    private String updatedAt;
    
    // Constructors
    public ChapterResponseDTO() {}
    
    public ChapterResponseDTO(Chapter chapter) {
        this.id = chapter.getId();
        this.name = chapter.getName();
        this.description = chapter.getDescription();
        this.moduleId = chapter.getModule().getId();
        this.moduleName = chapter.getModule().getName();
        this.topicId = chapter.getModule().getTopic().getId();
        this.topicName = chapter.getModule().getTopic().getName();
        this.subjectId = chapter.getModule().getTopic().getSubject().getId();
        this.subjectName = chapter.getModule().getTopic().getSubject().getName();
        this.subjectType = chapter.getModule().getTopic().getSubject().getSubjectType().toString();
        this.displayOrder = chapter.getDisplayOrder();
        this.isActive = chapter.getIsActive();
        this.youtubeLinks = chapter.getYoutubeLinks().stream()
                .map(link -> link.getYoutubeLink())
                .collect(Collectors.toList());
        this.uploadedFiles = chapter.getUploadedFiles().stream()
                .map(file -> file.getFileName())
                .collect(Collectors.toList());
        this.createdAt = chapter.getCreatedAt() != null ? chapter.getCreatedAt().toString() : null;
        this.updatedAt = chapter.getUpdatedAt() != null ? chapter.getUpdatedAt().toString() : null;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    
    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }
    
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
    
    public List<String> getYoutubeLinks() { return youtubeLinks; }
    public void setYoutubeLinks(List<String> youtubeLinks) { this.youtubeLinks = youtubeLinks; }
    
    public List<String> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<String> uploadedFiles) { this.uploadedFiles = uploadedFiles; }
    
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
```

## Repository Layer

### ChapterRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    
    List<Chapter> findByModuleIdAndIsActiveTrueOrderByDisplayOrderAsc(Long moduleId);
    
    List<Chapter> findByModuleIdOrderByDisplayOrderAsc(Long moduleId);
    
    @Query("SELECT c FROM Chapter c WHERE c.module.id = :moduleId AND c.isActive = :isActive ORDER BY c.displayOrder ASC")
    List<Chapter> findByModuleIdAndIsActiveOrderByDisplayOrderAsc(@Param("moduleId") Long moduleId, @Param("isActive") Boolean isActive);
    
    @Query("SELECT c FROM Chapter c WHERE c.module.id IN :moduleIds AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Chapter> findByModuleIdInAndIsActiveTrueOrderByDisplayOrderAsc(@Param("moduleIds") List<Long> moduleIds);
    
    @Query("SELECT c FROM Chapter c WHERE c.name LIKE %:name% AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Chapter> findByNameContainingAndIsActiveTrueOrderByDisplayOrderAsc(@Param("name") String name);
    
    @Query("SELECT c FROM Chapter c WHERE c.module.topic.subject.subjectType = :subjectType AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Chapter> findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(@Param("subjectType") String subjectType);
    
    @Query("SELECT c FROM Chapter c WHERE c.createdAt >= :createdAfter AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Chapter> findByCreatedAtAfterAndIsActiveTrueOrderByDisplayOrderAsc(@Param("createdAfter") LocalDateTime createdAfter);
    
    @Query("SELECT c FROM Chapter c WHERE c.module.topic.subject.courseType.id = :courseTypeId AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<Chapter> findByCourseTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(@Param("courseTypeId") Long courseTypeId);
    
    Optional<Chapter> findByNameAndModuleId(String name, Long moduleId);
    
    boolean existsByNameAndModuleId(String name, Long moduleId);
    
    boolean existsByNameAndModuleIdAndIdNot(String name, Long moduleId, Long id);
}
```

## Service Layer

### ChapterService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.ChapterRequestDTO;
import com.coaxialacademy.dto.response.ChapterResponseDTO;
import com.coaxialacademy.entity.Chapter;
import com.coaxialacademy.entity.Module;
import com.coaxialacademy.entity.ChapterYoutubeLink;
import com.coaxialacademy.entity.ChapterUploadedFile;
import com.coaxialacademy.repository.ChapterRepository;
import com.coaxialacademy.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChapterService {
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private ModuleRepository moduleRepository;
    
    public List<ChapterResponseDTO> getAllChapters() {
        return chapterRepository.findAll().stream()
                .map(ChapterResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<ChapterResponseDTO> getChaptersByModuleId(Long moduleId) {
        return chapterRepository.findByModuleIdAndIsActiveTrueOrderByDisplayOrderAsc(moduleId).stream()
                .map(ChapterResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<ChapterResponseDTO> getChaptersByModuleIds(List<Long> moduleIds) {
        return chapterRepository.findByModuleIdInAndIsActiveTrueOrderByDisplayOrderAsc(moduleIds).stream()
                .map(ChapterResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public List<ChapterResponseDTO> getChaptersWithFilters(Boolean isActive, String name, Long moduleId, Long topicId, Long subjectId, Long courseTypeId, LocalDateTime createdAfter) {
        List<Chapter> chapters;
        
        if (moduleId != null) {
            chapters = chapterRepository.findByModuleIdAndIsActiveOrderByDisplayOrderAsc(moduleId, isActive);
        } else if (subjectId != null) {
            chapters = chapterRepository.findBySubjectTypeAndIsActiveTrueOrderByDisplayOrderAsc(subjectId.toString());
        } else if (courseTypeId != null) {
            chapters = chapterRepository.findByCourseTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(courseTypeId);
        } else if (name != null && !name.trim().isEmpty()) {
            chapters = chapterRepository.findByNameContainingAndIsActiveTrueOrderByDisplayOrderAsc(name);
        } else if (createdAfter != null) {
            chapters = chapterRepository.findByCreatedAtAfterAndIsActiveTrueOrderByDisplayOrderAsc(createdAfter);
        } else {
            chapters = chapterRepository.findAll();
        }
        
        return chapters.stream()
                .map(ChapterResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public Page<ChapterResponseDTO> getChaptersPaginated(Pageable pageable) {
        return chapterRepository.findAll(pageable)
                .map(ChapterResponseDTO::new);
    }
    
    public Optional<ChapterResponseDTO> getChapterById(Long id) {
        return chapterRepository.findById(id)
                .map(ChapterResponseDTO::new);
    }
    
    public ChapterResponseDTO createChapter(ChapterRequestDTO chapterRequestDTO) {
        // Validate module exists
        Module module = moduleRepository.findById(chapterRequestDTO.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found with ID: " + chapterRequestDTO.getModuleId()));
        
        // Check for duplicate name within the same module
        if (chapterRepository.existsByNameAndModuleId(chapterRequestDTO.getName(), chapterRequestDTO.getModuleId())) {
            throw new IllegalArgumentException("Chapter with name '" + chapterRequestDTO.getName() + "' already exists for this module");
        }
        
        Chapter chapter = new Chapter();
        chapter.setName(chapterRequestDTO.getName());
        chapter.setDescription(chapterRequestDTO.getDescription());
        chapter.setModule(module);
        chapter.setDisplayOrder(chapterRequestDTO.getDisplayOrder());
        chapter.setIsActive(chapterRequestDTO.getIsActive());
        
        // Handle YouTube links
        if (chapterRequestDTO.getYoutubeLinks() != null && !chapterRequestDTO.getYoutubeLinks().isEmpty()) {
            List<ChapterYoutubeLink> youtubeLinks = new ArrayList<>();
            for (int i = 0; i < chapterRequestDTO.getYoutubeLinks().size(); i++) {
                ChapterYoutubeLink link = new ChapterYoutubeLink();
                link.setChapter(chapter);
                link.setYoutubeLink(chapterRequestDTO.getYoutubeLinks().get(i));
                link.setDisplayOrder(i);
                youtubeLinks.add(link);
            }
            chapter.setYoutubeLinks(youtubeLinks);
        }
        
        // Handle uploaded files
        if (chapterRequestDTO.getUploadedFiles() != null && !chapterRequestDTO.getUploadedFiles().isEmpty()) {
            List<ChapterUploadedFile> uploadedFiles = new ArrayList<>();
            for (int i = 0; i < chapterRequestDTO.getUploadedFiles().size(); i++) {
                ChapterUploadedFile file = new ChapterUploadedFile();
                file.setChapter(chapter);
                file.setFileName(chapterRequestDTO.getUploadedFiles().get(i));
                file.setDisplayOrder(i);
                uploadedFiles.add(file);
            }
            chapter.setUploadedFiles(uploadedFiles);
        }
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return new ChapterResponseDTO(savedChapter);
    }
    
    public ChapterResponseDTO updateChapter(Long id, ChapterRequestDTO chapterRequestDTO) {
        Chapter existingChapter = chapterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found with ID: " + id));
        
        // Validate module exists
        Module module = moduleRepository.findById(chapterRequestDTO.getModuleId())
                .orElseThrow(() -> new IllegalArgumentException("Module not found with ID: " + chapterRequestDTO.getModuleId()));
        
        // Check for duplicate name within the same module (excluding current chapter)
        if (chapterRepository.existsByNameAndModuleIdAndIdNot(chapterRequestDTO.getName(), chapterRequestDTO.getModuleId(), id)) {
            throw new IllegalArgumentException("Chapter with name '" + chapterRequestDTO.getName() + "' already exists for this module");
        }
        
        existingChapter.setName(chapterRequestDTO.getName());
        existingChapter.setDescription(chapterRequestDTO.getDescription());
        existingChapter.setModule(module);
        existingChapter.setDisplayOrder(chapterRequestDTO.getDisplayOrder());
        existingChapter.setIsActive(chapterRequestDTO.getIsActive());
        
        // Update YouTube links
        if (chapterRequestDTO.getYoutubeLinks() != null) {
            existingChapter.getYoutubeLinks().clear();
            for (int i = 0; i < chapterRequestDTO.getYoutubeLinks().size(); i++) {
                ChapterYoutubeLink link = new ChapterYoutubeLink();
                link.setChapter(existingChapter);
                link.setYoutubeLink(chapterRequestDTO.getYoutubeLinks().get(i));
                link.setDisplayOrder(i);
                existingChapter.getYoutubeLinks().add(link);
            }
        }
        
        // Update uploaded files
        if (chapterRequestDTO.getUploadedFiles() != null) {
            existingChapter.getUploadedFiles().clear();
            for (int i = 0; i < chapterRequestDTO.getUploadedFiles().size(); i++) {
                ChapterUploadedFile file = new ChapterUploadedFile();
                file.setChapter(existingChapter);
                file.setFileName(chapterRequestDTO.getUploadedFiles().get(i));
                file.setDisplayOrder(i);
                existingChapter.getUploadedFiles().add(file);
            }
        }
        
        Chapter updatedChapter = chapterRepository.save(existingChapter);
        return new ChapterResponseDTO(updatedChapter);
    }
    
    public void deleteChapter(Long id) {
        if (!chapterRepository.existsById(id)) {
            throw new IllegalArgumentException("Chapter not found with ID: " + id);
        }
        chapterRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return chapterRepository.existsById(id);
    }
}
```

## Controller Layer

### ChapterController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.ChapterRequestDTO;
import com.coaxialacademy.dto.response.ChapterResponseDTO;
import com.coaxialacademy.service.ChapterService;
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
@RequestMapping("/api/admin/master-data/chapters")
@CrossOrigin(origins = "*")
public class ChapterController {
    
    @Autowired
    private ChapterService chapterService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ChapterResponseDTO>> getAllChapters() {
        List<ChapterResponseDTO> chapters = chapterService.getAllChapters();
        return ResponseEntity.ok(chapters);
    }
    
    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ChapterResponseDTO>> getChaptersByModuleId(@PathVariable Long moduleId) {
        List<ChapterResponseDTO> chapters = chapterService.getChaptersByModuleId(moduleId);
        return ResponseEntity.ok(chapters);
    }
    
    @GetMapping("/filtered")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<ChapterResponseDTO>> getChaptersWithFilters(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long moduleId,
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
        
        List<ChapterResponseDTO> chapters = chapterService.getChaptersWithFilters(active, name, moduleId, topicId, subjectId, courseTypeId, createdAfterDate);
        return ResponseEntity.ok(chapters);
    }
    
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Page<ChapterResponseDTO>> getChaptersPaginated(Pageable pageable) {
        Page<ChapterResponseDTO> chapters = chapterService.getChaptersPaginated(pageable);
        return ResponseEntity.ok(chapters);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ChapterResponseDTO> getChapterById(@PathVariable Long id) {
        Optional<ChapterResponseDTO> chapter = chapterService.getChapterById(id);
        return chapter.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChapterResponseDTO> createChapter(@Valid @RequestBody ChapterRequestDTO chapterRequestDTO) {
        try {
            ChapterResponseDTO createdChapter = chapterService.createChapter(chapterRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdChapter);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChapterResponseDTO> updateChapter(@PathVariable Long id, @Valid @RequestBody ChapterRequestDTO chapterRequestDTO) {
        try {
            ChapterResponseDTO updatedChapter = chapterService.updateChapter(id, chapterRequestDTO);
            return ResponseEntity.ok(updatedChapter);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        try {
            chapterService.deleteChapter(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

## API Endpoints

### Chapter Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/master-data/chapters` | Get all chapters | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/chapters/module/{moduleId}` | Get chapters by module ID | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/chapters/filtered` | Get chapters with filters | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/chapters/paginated` | Get paginated chapters | ADMIN, INSTRUCTOR |
| GET | `/api/admin/master-data/chapters/{id}` | Get chapter by ID | ADMIN, INSTRUCTOR |
| POST | `/api/admin/master-data/chapters` | Create new chapter | ADMIN |
| PUT | `/api/admin/master-data/chapters/{id}` | Update chapter | ADMIN |
| DELETE | `/api/admin/master-data/chapters/{id}` | Delete chapter | ADMIN |

## Request/Response Examples

### Create Chapter
```json
POST /api/admin/master-data/chapters
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Introduction to Addition",
  "description": "Basic concepts of addition with examples and exercises",
  "moduleId": 1,
  "displayOrder": 1,
  "isActive": true,
  "youtubeLinks": [
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=def456"
  ],
  "uploadedFiles": [
    "addition_worksheet.pdf",
    "practice_problems.docx"
  ]
}

Response:
{
  "id": 1,
  "name": "Introduction to Addition",
  "description": "Basic concepts of addition with examples and exercises",
  "moduleId": 1,
  "moduleName": "Basic Addition Concepts",
  "topicId": 1,
  "topicName": "Addition of Two Numbers",
  "subjectId": 1,
  "subjectName": "Mathematics",
  "subjectType": "ACADEMIC",
  "displayOrder": 1,
  "isActive": true,
  "youtubeLinks": [
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=def456"
  ],
  "uploadedFiles": [
    "addition_worksheet.pdf",
    "practice_problems.docx"
  ],
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Get Chapters with Filters
```json
GET /api/admin/master-data/chapters/filtered?active=true&name=addition&moduleId=1

Response:
[
  {
    "id": 1,
    "name": "Introduction to Addition",
    "description": "Basic concepts of addition with examples and exercises",
    "moduleId": 1,
    "moduleName": "Basic Addition Concepts",
    "topicId": 1,
    "topicName": "Addition of Two Numbers",
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": "ACADEMIC",
    "displayOrder": 1,
    "isActive": true,
    "youtubeLinks": [
      "https://www.youtube.com/watch?v=abc123",
      "https://www.youtube.com/watch?v=def456"
    ],
    "uploadedFiles": [
      "addition_worksheet.pdf",
      "practice_problems.docx"
    ],
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

### Get Chapters by Module
```json
GET /api/admin/master-data/chapters/module/1

Response:
[
  {
    "id": 1,
    "name": "Introduction to Addition",
    "description": "Basic concepts of addition with examples and exercises",
    "moduleId": 1,
    "moduleName": "Basic Addition Concepts",
    "topicId": 1,
    "topicName": "Addition of Two Numbers",
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": "ACADEMIC",
    "displayOrder": 1,
    "isActive": true,
    "youtubeLinks": [
      "https://www.youtube.com/watch?v=abc123",
      "https://www.youtube.com/watch?v=def456"
    ],
    "uploadedFiles": [
      "addition_worksheet.pdf",
      "practice_problems.docx"
    ],
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Advanced Addition Techniques",
    "description": "Advanced addition methods and problem solving",
    "moduleId": 1,
    "moduleName": "Basic Addition Concepts",
    "topicId": 1,
    "topicName": "Addition of Two Numbers",
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": "ACADEMIC",
    "displayOrder": 2,
    "isActive": true,
    "youtubeLinks": [
      "https://www.youtube.com/watch?v=ghi789"
    ],
    "uploadedFiles": [
      "advanced_problems.pdf"
    ],
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/admin/master-data/chapters"
}
```

#### 404 Not Found
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Chapter not found with ID: 999",
  "path": "/api/chapters/999"
}
```

#### 401 Unauthorized
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/admin/master-data/chapters"
}
```

#### 403 Forbidden
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/admin/master-data/chapters"
}
```

## Implementation Notes

1. **Security**: All endpoints require ADMIN role authentication for write operations, ADMIN/INSTRUCTOR for read operations
2. **Validation**: Input validation using Bean Validation annotations
3. **Relationships**: Proper handling of Module-Topic-Subject relationships with hierarchical information
4. **Multimedia Support**: Support for multiple YouTube links and file uploads with proper entity relationships
5. **Filtering**: Advanced filtering capabilities for efficient data retrieval across the hierarchy
6. **Error Handling**: Comprehensive error handling with meaningful messages
7. **Timestamps**: Automatic creation and update timestamps
8. **Cascading**: Proper cascade delete for related collections
9. **Consistency**: Aligned with Topic and Module Management API patterns

This implementation provides a complete Chapter Management API that seamlessly integrates with the React frontend component and maintains consistency with the overall system architecture! 🚀
