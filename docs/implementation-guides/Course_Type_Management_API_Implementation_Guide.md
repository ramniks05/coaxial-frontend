# Course Type Management API Implementation Guide

## Overview
This document provides complete implementation details for the Course Type Management API in Spring Boot for Coaxial Academy. The system supports different educational structures where each course type has its own hierarchical structure to accommodate various learning paths.

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
10. [Implementation Notes](#implementation-notes)

## Database Schema

```sql
-- Course Types table
CREATE TABLE course_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    structure_type ENUM('ACADEMIC', 'COMPETITIVE', 'PROFESSIONAL', 'CUSTOM') NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default course types
INSERT INTO course_types (name, description, structure_type, display_order) VALUES
('Academic', 'Traditional academic courses with classes and subjects', 'ACADEMIC', 1),
('Competitive Exams', 'Exam-focused courses for competitive examinations', 'COMPETITIVE', 2),
('Professional', 'Professional development and skill-based courses', 'PROFESSIONAL', 3);
```

## Entity Classes

### CourseType Entity
```java
@Entity
@Table(name = "course_types")
public class CourseType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "structure_type", nullable = false)
    private StructureType structureType;
    
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
    
    // Constructors
    public CourseType() {}
    
    public CourseType(String name, String description, StructureType structureType) {
        this.name = name;
        this.description = description;
        this.structureType = structureType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public StructureType getStructureType() { return structureType; }
    public void setStructureType(StructureType structureType) { this.structureType = structureType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

### StructureType Enum
```java
public enum StructureType {
    ACADEMIC("Academic", "CourseType → Course → Class → Subject → Topic → Module → Chapter"),
    COMPETITIVE("Competitive", "CourseType → Course → Exam → Subject → Topic → Module → Chapter"),
    PROFESSIONAL("Professional", "CourseType → Course → Subject → Topic → Module → Chapter"),
    CUSTOM("Custom", "Flexible structure based on requirements");
    
    private final String displayName;
    private final String structureDescription;
    
    StructureType(String displayName, String structureDescription) {
        this.displayName = displayName;
        this.structureDescription = structureDescription;
    }
    
    public String getDisplayName() { return displayName; }
    public String getStructureDescription() { return structureDescription; }
}
```

## DTOs

### CourseTypeRequest
```java
public class CourseTypeRequest {
    @NotBlank(message = "Course type name is required")
    @Size(max = 255, message = "Course type name must not exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Structure type is required")
    private StructureType structureType;
    
    @Min(value = 0, message = "Display order must be non-negative")
    private Integer displayOrder;
    
    private Boolean isActive;
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public StructureType getStructureType() { return structureType; }
    public void setStructureType(StructureType structureType) { this.structureType = structureType; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

### CourseTypeResponse
```java
public class CourseTypeResponse {
    private Long id;
    private String name;
    private String description;
    private StructureType structureType;
    private String structureDescription;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public StructureType getStructureType() { return structureType; }
    public void setStructureType(StructureType structureType) { this.structureType = structureType; }
    
    public String getStructureDescription() { return structureDescription; }
    public void setStructureDescription(String structureDescription) { this.structureDescription = structureDescription; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
```

## Repository Layer

```java
@Repository
public interface CourseTypeRepository extends JpaRepository<CourseType, Long> {
    
    // Find by name (case insensitive)
    Optional<CourseType> findByNameIgnoreCase(String name);
    
    // Find active course types
    List<CourseType> findByIsActiveTrue();
    
    // Find by structure type
    List<CourseType> findByStructureType(StructureType structureType);
    
    // Find active course types by structure type
    List<CourseType> findByStructureTypeAndIsActiveTrue(StructureType structureType);
    
    // Find all ordered by display order
    List<CourseType> findAllByOrderByDisplayOrderAsc();
    
    // Find active course types ordered by display order
    List<CourseType> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    // Check if name exists (excluding current record for updates)
    @Query("SELECT COUNT(c) > 0 FROM CourseType c WHERE LOWER(c.name) = LOWER(:name) AND c.id != :id")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);
    
    // Check if name exists
    boolean existsByNameIgnoreCase(String name);
}
```

## Service Layer

```java
@Service
@Transactional
public class CourseTypeService {
    
    @Autowired
    private CourseTypeRepository courseTypeRepository;
    
    public List<CourseTypeResponse> getAllCourseTypes(Boolean active) {
        List<CourseType> courseTypes;
        
        if (active != null && active) {
            courseTypes = courseTypeRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        } else {
            courseTypes = courseTypeRepository.findAllByOrderByDisplayOrderAsc();
        }
        
        return courseTypes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public CourseTypeResponse getCourseTypeById(Long id) {
        CourseType courseType = courseTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course type not found with id: " + id));
        return convertToResponse(courseType);
    }
    
    public CourseTypeResponse createCourseType(CourseTypeRequest request) {
        // Check if name already exists
        if (courseTypeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Course type with name '" + request.getName() + "' already exists");
        }
        
        CourseType courseType = new CourseType();
        courseType.setName(request.getName());
        courseType.setDescription(request.getDescription());
        courseType.setStructureType(request.getStructureType());
        courseType.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        courseType.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        CourseType savedCourseType = courseTypeRepository.save(courseType);
        return convertToResponse(savedCourseType);
    }
    
    public CourseTypeResponse updateCourseType(Long id, CourseTypeRequest request) {
        CourseType courseType = courseTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course type not found with id: " + id));
        
        // Check if name already exists (excluding current record)
        if (courseTypeRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Course type with name '" + request.getName() + "' already exists");
        }
        
        courseType.setName(request.getName());
        courseType.setDescription(request.getDescription());
        courseType.setStructureType(request.getStructureType());
        courseType.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : courseType.getDisplayOrder());
        courseType.setIsActive(request.getIsActive() != null ? request.getIsActive() : courseType.getIsActive());
        
        CourseType updatedCourseType = courseTypeRepository.save(courseType);
        return convertToResponse(updatedCourseType);
    }
    
    public void deleteCourseType(Long id) {
        CourseType courseType = courseTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course type not found with id: " + id));
        
        // TODO: Add validation to check if course type is being used by any courses
        // if (courseRepository.existsByCourseTypeId(id)) {
        //     throw new IllegalStateException("Cannot delete course type that is being used by courses");
        // }
        
        courseTypeRepository.deleteById(id);
    }
    
    public List<StructureType> getAvailableStructureTypes() {
        return Arrays.asList(StructureType.values());
    }
    
    public CourseTypeResponse toggleActiveStatus(Long id) {
        CourseType courseType = courseTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Course type not found with id: " + id));
        
        courseType.setIsActive(!courseType.getIsActive());
        CourseType updatedCourseType = courseTypeRepository.save(courseType);
        return convertToResponse(updatedCourseType);
    }
    
    private CourseTypeResponse convertToResponse(CourseType courseType) {
        CourseTypeResponse response = new CourseTypeResponse();
        response.setId(courseType.getId());
        response.setName(courseType.getName());
        response.setDescription(courseType.getDescription());
        response.setStructureType(courseType.getStructureType());
        response.setStructureDescription(courseType.getStructureType().getStructureDescription());
        response.setDisplayOrder(courseType.getDisplayOrder());
        response.setIsActive(courseType.getIsActive());
        response.setCreatedAt(courseType.getCreatedAt());
        response.setUpdatedAt(courseType.getUpdatedAt());
        return response;
    }
}
```

## Controller Layer

```java
@RestController
@RequestMapping("/api/admin/master-data/course-types")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class CourseTypeController {
    
    @Autowired
    private CourseTypeService courseTypeService;
    
    @GetMapping
    public ResponseEntity<List<CourseTypeResponse>> getAllCourseTypes(
            @RequestParam(required = false) Boolean active) {
        
        List<CourseTypeResponse> courseTypes = courseTypeService.getAllCourseTypes(active);
        return ResponseEntity.ok(courseTypes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseTypeResponse> getCourseTypeById(@PathVariable Long id) {
        CourseTypeResponse courseType = courseTypeService.getCourseTypeById(id);
        return ResponseEntity.ok(courseType);
    }
    
    @PostMapping
    public ResponseEntity<CourseTypeResponse> createCourseType(@Valid @RequestBody CourseTypeRequest request) {
        CourseTypeResponse courseType = courseTypeService.createCourseType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseType);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CourseTypeResponse> updateCourseType(
            @PathVariable Long id, 
            @Valid @RequestBody CourseTypeRequest request) {
        CourseTypeResponse courseType = courseTypeService.updateCourseType(id, request);
        return ResponseEntity.ok(courseType);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourseType(@PathVariable Long id) {
        courseTypeService.deleteCourseType(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<CourseTypeResponse> toggleActiveStatus(@PathVariable Long id) {
        CourseTypeResponse courseType = courseTypeService.toggleActiveStatus(id);
        return ResponseEntity.ok(courseType);
    }
    
    @GetMapping("/structure-types")
    public ResponseEntity<List<StructureType>> getAvailableStructureTypes() {
        List<StructureType> structureTypes = courseTypeService.getAvailableStructureTypes();
        return ResponseEntity.ok(structureTypes);
    }
}
```

## API Endpoints

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/admin/master-data/course-types` | Get all course types | `active` (optional) |
| GET | `/api/admin/master-data/course-types/{id}` | Get course type by ID | `id` (path parameter) |
| POST | `/api/admin/master-data/course-types` | Create new course type | Request body |
| PUT | `/api/admin/master-data/course-types/{id}` | Update course type | `id` (path parameter), Request body |
| DELETE | `/api/admin/master-data/course-types/{id}` | Delete course type | `id` (path parameter) |
| PATCH | `/api/admin/master-data/course-types/{id}/toggle-status` | Toggle active status | `id` (path parameter) |
| GET | `/api/admin/master-data/course-types/structure-types` | Get available structure types | None |

## Request/Response Examples

### Create Course Type Request
```json
POST /api/admin/master-data/course-types
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Academic",
  "description": "Traditional academic courses with classes and subjects",
  "structureType": "ACADEMIC",
  "displayOrder": 1,
  "isActive": true
}
```

### Create Course Type Response
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "Academic",
  "description": "Traditional academic courses with classes and subjects",
  "structureType": "ACADEMIC",
  "structureDescription": "CourseType → Course → Class → Subject → Topic → Module → Chapter",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Get All Course Types Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "name": "Academic",
    "description": "Traditional academic courses with classes and subjects",
    "structureType": "ACADEMIC",
    "structureDescription": "CourseType → Course → Class → Subject → Topic → Module → Chapter",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Competitive Exams",
    "description": "Exam-focused courses for competitive examinations",
    "structureType": "COMPETITIVE",
    "structureDescription": "CourseType → Course → Exam → Subject → Topic → Module → Chapter",
    "displayOrder": 2,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 3,
    "name": "Professional",
    "description": "Professional development and skill-based courses",
    "structureType": "PROFESSIONAL",
    "structureDescription": "CourseType → Course → Subject → Topic → Module → Chapter",
    "displayOrder": 3,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

### Get Available Structure Types Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "name": "ACADEMIC",
    "displayName": "Academic",
    "structureDescription": "CourseType → Course → Class → Subject → Topic → Module → Chapter"
  },
  {
    "name": "COMPETITIVE",
    "displayName": "Competitive",
    "structureDescription": "CourseType → Course → Exam → Subject → Topic → Module → Chapter"
  },
  {
    "name": "PROFESSIONAL",
    "displayName": "Professional",
    "structureDescription": "CourseType → Course → Subject → Topic → Module → Chapter"
  },
  {
    "name": "CUSTOM",
    "displayName": "Custom",
    "structureDescription": "Flexible structure based on requirements"
  }
]
```

## Error Handling

### Common Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Course type name is required"
    },
    {
      "field": "structureType",
      "message": "Structure type is required"
    }
  ],
  "path": "/api/admin/master-data/course-types"
}
```

#### 400 Bad Request - Duplicate Name
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Course type with name 'Academic' already exists",
  "path": "/api/admin/master-data/course-types"
}
```

#### 404 Not Found
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Course type not found with id: 999",
  "path": "/api/admin/master-data/course-types/999"
}
```

#### 401 Unauthorized
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/admin/master-data/course-types"
}
```

#### 403 Forbidden
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/admin/master-data/course-types"
}
```

## Implementation Notes

### Key Features

1. **Structure Types**: Each course type has a predefined structure that will guide the frontend in showing the correct hierarchy:
   - **ACADEMIC**: CourseType → Course → Class → Subject → Topic → Module → Chapter
   - **COMPETITIVE**: CourseType → Course → Exam → Subject → Topic → Module → Chapter
   - **PROFESSIONAL**: CourseType → Course → Subject → Topic → Module → Chapter
   - **CUSTOM**: Flexible structure based on requirements

2. **Validation**: 
   - Name uniqueness is enforced (case-insensitive)
   - Required field validation
   - Size constraints on text fields

3. **Soft Delete**: Use `isActive` flag instead of hard delete for data integrity

4. **Display Order**: Allows custom ordering of course types for better UX

5. **Extensibility**: Easy to add new structure types in the future

6. **Security**: All endpoints require ADMIN role authentication

7. **Error Handling**: Comprehensive validation and meaningful error messages

### Database Considerations

- Use `ENUM` for structure types to ensure data consistency
- `UNIQUE` constraint on name field
- Proper indexing on frequently queried fields
- Timestamps for audit trail

### Future Enhancements

1. **Course Validation**: Add validation to prevent deletion of course types that are being used by courses
2. **Bulk Operations**: Add endpoints for bulk create/update/delete operations
3. **Audit Logging**: Add detailed audit logs for all operations
4. **Caching**: Implement caching for frequently accessed course types
5. **Search**: Add search functionality with filters

This implementation provides a solid foundation for Course Type Management that will support the different educational structures in Coaxial Academy and can be easily extended as new requirements emerge.
