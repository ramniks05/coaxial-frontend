# Chapter Management API Implementation Guide
## Multipart Form Data Support

### 📋 Overview
This document provides a complete implementation guide for the Chapter Management API with multipart form data support, allowing file uploads alongside chapter data in a single request.

### 🏗️ Backend Implementation

#### 1. Dependencies (pom.xml)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

#### 2. Entity Classes

##### Chapter Entity
```java
@Entity
@Table(name = "chapters")
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChapterYoutubeLink> youtubeLinks = new ArrayList<>();

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChapterUploadedFile> uploadedFiles = new ArrayList<>();

    // Constructors, getters, setters
}
```

##### ChapterYoutubeLink Entity
```java
@Entity
@Table(name = "chapter_youtube_links")
public class ChapterYoutubeLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url", nullable = false)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;

    // Constructors, getters, setters
}
```

##### ChapterUploadedFile Entity
```java
@Entity
@Table(name = "chapter_uploaded_files")
public class ChapterUploadedFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type")
    private String contentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;

    // Constructors, getters, setters
}
```

#### 3. DTO Classes

##### ChapterRequestDTO
```java
public class ChapterRequestDTO {
    private String name;
    private String description;
    private Long moduleId;
    private Integer displayOrder;
    private Boolean isActive;
    private List<String> youtubeLinks;
    private List<String> uploadedFiles;

    // Constructors
    public ChapterRequestDTO() {}

    public ChapterRequestDTO(String name, String description, Long moduleId, 
                           Integer displayOrder, Boolean isActive, 
                           List<String> youtubeLinks, List<String> uploadedFiles) {
        this.name = name;
        this.description = description;
        this.moduleId = moduleId;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
        this.youtubeLinks = youtubeLinks;
        this.uploadedFiles = uploadedFiles;
    }

    // Getters and setters
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

##### ChapterResponseDTO
```java
public class ChapterResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Long moduleId;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> youtubeLinks;
    private List<String> uploadedFiles;

    // Constructors
    public ChapterResponseDTO() {}

    public ChapterResponseDTO(Long id, String name, String description, Long moduleId, 
                            Integer displayOrder, Boolean isActive, LocalDateTime createdAt, 
                            LocalDateTime updatedAt, List<String> youtubeLinks, 
                            List<String> uploadedFiles) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.moduleId = moduleId;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.youtubeLinks = youtubeLinks;
        this.uploadedFiles = uploadedFiles;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<String> getYoutubeLinks() { return youtubeLinks; }
    public void setYoutubeLinks(List<String> youtubeLinks) { this.youtubeLinks = youtubeLinks; }

    public List<String> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<String> uploadedFiles) { this.uploadedFiles = uploadedFiles; }
}
```

#### 4. Repository Layer

##### ChapterRepository
```java
@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    
    @Query("SELECT c FROM Chapter c WHERE c.moduleId = :moduleId AND c.isActive = :isActive ORDER BY c.displayOrder ASC")
    List<Chapter> findByModuleIdAndIsActiveOrderByDisplayOrder(@Param("moduleId") Long moduleId, 
                                                              @Param("isActive") Boolean isActive);
    
    @Query("SELECT c FROM Chapter c WHERE c.moduleId = :moduleId ORDER BY c.displayOrder ASC")
    List<Chapter> findByModuleIdOrderByDisplayOrder(@Param("moduleId") Long moduleId);
    
    @Query("SELECT c FROM Chapter c WHERE c.isActive = :isActive ORDER BY c.displayOrder ASC")
    List<Chapter> findByIsActiveOrderByDisplayOrder(@Param("isActive") Boolean isActive);
    
    @Query("SELECT c FROM Chapter c ORDER BY c.displayOrder ASC")
    List<Chapter> findAllOrderByDisplayOrder();
    
    @Query("SELECT c FROM Chapter c WHERE c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%")
    List<Chapter> findByNameOrDescriptionContaining(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE c.moduleId = :moduleId AND (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByModuleIdAndNameOrDescriptionContaining(@Param("moduleId") Long moduleId, 
                                                              @Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE c.isActive = :isActive AND (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByIsActiveAndNameOrDescriptionContaining(@Param("isActive") Boolean isActive, 
                                                              @Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByNameOrDescriptionContaining(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE c.moduleId = :moduleId AND c.isActive = :isActive AND (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByModuleIdAndIsActiveAndNameOrDescriptionContaining(@Param("moduleId") Long moduleId, 
                                                                          @Param("isActive") Boolean isActive, 
                                                                          @Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE c.moduleId = :moduleId AND (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByModuleIdAndNameOrDescriptionContaining(@Param("moduleId") Long moduleId, 
                                                              @Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE c.isActive = :isActive AND (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByIsActiveAndNameOrDescriptionContaining(@Param("isActive") Boolean isActive, 
                                                              @Param("searchTerm") String searchTerm);
    
    @Query("SELECT c FROM Chapter c WHERE (c.name LIKE %:searchTerm% OR c.description LIKE %:searchTerm%)")
    List<Chapter> findByNameOrDescriptionContaining(@Param("searchTerm") String searchTerm);
}
```

#### 5. Service Layer

##### ChapterService
```java
@Service
@Transactional
public class ChapterService {

    @Value("${app.upload.dir:uploads/chapters}")
    private String uploadDir;

    @Autowired
    private ChapterRepository chapterRepository;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    public List<String> saveUploadedFiles(List<MultipartFile> files) throws IOException {
        List<String> filePaths = new ArrayList<>();
        
        if (files == null || files.isEmpty()) {
            return filePaths;
        }
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // Validate file type
                String contentType = file.getContentType();
                if (!"application/pdf".equals(contentType)) {
                    throw new IllegalArgumentException("Only PDF files are allowed. Received: " + contentType);
                }
                
                // Generate unique filename
                String originalFilename = file.getOriginalFilename();
                String filename = System.currentTimeMillis() + "_" + originalFilename;
                
                // Save file
                Path filePath = Paths.get(uploadDir).resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                // Store relative path
                String relativePath = "/api/admin/master-data/chapters/files/" + filename;
                filePaths.add(relativePath);
            }
        }
        
        return filePaths;
    }

    public ChapterResponseDTO createChapter(ChapterRequestDTO requestDTO) {
        Chapter chapter = new Chapter();
        
        // Map basic fields
        chapter.setName(requestDTO.getName());
        chapter.setDescription(requestDTO.getDescription());
        chapter.setModuleId(requestDTO.getModuleId());
        chapter.setDisplayOrder(requestDTO.getDisplayOrder());
        chapter.setIsActive(requestDTO.getIsActive());
        chapter.setCreatedAt(LocalDateTime.now());
        chapter.setUpdatedAt(LocalDateTime.now());
        
        // Handle YouTube links
        if (requestDTO.getYoutubeLinks() != null) {
            List<ChapterYoutubeLink> youtubeLinks = requestDTO.getYoutubeLinks().stream()
                .map(url -> {
                    ChapterYoutubeLink link = new ChapterYoutubeLink();
                    link.setUrl(url);
                    link.setChapter(chapter);
                    return link;
                })
                .collect(Collectors.toList());
            chapter.setYoutubeLinks(youtubeLinks);
        }
        
        // Handle uploaded files
        if (requestDTO.getUploadedFiles() != null) {
            List<ChapterUploadedFile> uploadedFiles = requestDTO.getUploadedFiles().stream()
                .map(filePath -> {
                    ChapterUploadedFile file = new ChapterUploadedFile();
                    file.setFilePath(filePath);
                    file.setChapter(chapter);
                    return file;
                })
                .collect(Collectors.toList());
            chapter.setUploadedFiles(uploadedFiles);
        }
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return mapToResponseDTO(savedChapter);
    }

    public ChapterResponseDTO updateChapter(Long id, ChapterRequestDTO requestDTO) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id: " + id));
        
        // Update fields
        chapter.setName(requestDTO.getName());
        chapter.setDescription(requestDTO.getDescription());
        chapter.setModuleId(requestDTO.getModuleId());
        chapter.setDisplayOrder(requestDTO.getDisplayOrder());
        chapter.setIsActive(requestDTO.getIsActive());
        chapter.setUpdatedAt(LocalDateTime.now());
        
        // Update YouTube links
        if (requestDTO.getYoutubeLinks() != null) {
            // Clear existing links
            chapter.getYoutubeLinks().clear();
            
            List<ChapterYoutubeLink> youtubeLinks = requestDTO.getYoutubeLinks().stream()
                .map(url -> {
                    ChapterYoutubeLink link = new ChapterYoutubeLink();
                    link.setUrl(url);
                    link.setChapter(chapter);
                    return link;
                })
                .collect(Collectors.toList());
            chapter.setYoutubeLinks(youtubeLinks);
        }
        
        // Update uploaded files
        if (requestDTO.getUploadedFiles() != null) {
            // Clear existing files
            chapter.getUploadedFiles().clear();
            
            List<ChapterUploadedFile> uploadedFiles = requestDTO.getUploadedFiles().stream()
                .map(filePath -> {
                    ChapterUploadedFile file = new ChapterUploadedFile();
                    file.setFilePath(filePath);
                    file.setChapter(chapter);
                    return file;
                })
                .collect(Collectors.toList());
            chapter.setUploadedFiles(uploadedFiles);
        }
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return mapToResponseDTO(savedChapter);
    }

    public ChapterResponseDTO getChapterById(Long id) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id: " + id));
        return mapToResponseDTO(chapter);
    }

    public List<ChapterResponseDTO> getChaptersByModule(Long moduleId, Boolean isActive) {
        List<Chapter> chapters;
        if (isActive != null) {
            chapters = chapterRepository.findByModuleIdAndIsActiveOrderByDisplayOrder(moduleId, isActive);
        } else {
            chapters = chapterRepository.findByModuleIdOrderByDisplayOrder(moduleId);
        }
        return chapters.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public List<ChapterResponseDTO> getAllChapters(Boolean isActive) {
        List<Chapter> chapters;
        if (isActive != null) {
            chapters = chapterRepository.findByIsActiveOrderByDisplayOrder(isActive);
        } else {
            chapters = chapterRepository.findAllOrderByDisplayOrder();
        }
        return chapters.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public List<ChapterResponseDTO> searchChapters(String searchTerm, Long moduleId, Boolean isActive) {
        List<Chapter> chapters;
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            if (moduleId != null && isActive != null) {
                chapters = chapterRepository.findByModuleIdAndIsActiveOrderByDisplayOrder(moduleId, isActive);
            } else if (moduleId != null) {
                chapters = chapterRepository.findByModuleIdOrderByDisplayOrder(moduleId);
            } else if (isActive != null) {
                chapters = chapterRepository.findByIsActiveOrderByDisplayOrder(isActive);
            } else {
                chapters = chapterRepository.findAllOrderByDisplayOrder();
            }
        } else {
            if (moduleId != null && isActive != null) {
                chapters = chapterRepository.findByModuleIdAndIsActiveAndNameOrDescriptionContaining(moduleId, isActive, searchTerm);
            } else if (moduleId != null) {
                chapters = chapterRepository.findByModuleIdAndNameOrDescriptionContaining(moduleId, searchTerm);
            } else if (isActive != null) {
                chapters = chapterRepository.findByIsActiveAndNameOrDescriptionContaining(isActive, searchTerm);
            } else {
                chapters = chapterRepository.findByNameOrDescriptionContaining(searchTerm);
            }
        }
        
        return chapters.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public void deleteChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id: " + id));
        
        // Delete associated files from filesystem
        if (chapter.getUploadedFiles() != null) {
            for (ChapterUploadedFile file : chapter.getUploadedFiles()) {
                try {
                    String filePath = file.getFilePath();
                    if (filePath != null && filePath.startsWith("/api/admin/master-data/chapters/files/")) {
                        String filename = filePath.substring(filePath.lastIndexOf("/") + 1);
                        Path fileToDelete = Paths.get(uploadDir).resolve(filename);
                        Files.deleteIfExists(fileToDelete);
                    }
                } catch (IOException e) {
                    // Log error but don't fail the delete operation
                    System.err.println("Failed to delete file: " + file.getFilePath());
                }
            }
        }
        
        chapterRepository.delete(chapter);
    }

    public ChapterResponseDTO updateChapterStatus(Long id, Boolean isActive) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id: " + id));
        
        chapter.setIsActive(isActive);
        chapter.setUpdatedAt(LocalDateTime.now());
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return mapToResponseDTO(savedChapter);
    }

    public ChapterResponseDTO updateChapterDisplayOrder(Long id, Integer displayOrder) {
        Chapter chapter = chapterRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id: " + id));
        
        chapter.setDisplayOrder(displayOrder);
        chapter.setUpdatedAt(LocalDateTime.now());
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return mapToResponseDTO(savedChapter);
    }

    private ChapterResponseDTO mapToResponseDTO(Chapter chapter) {
        ChapterResponseDTO dto = new ChapterResponseDTO();
        dto.setId(chapter.getId());
        dto.setName(chapter.getName());
        dto.setDescription(chapter.getDescription());
        dto.setModuleId(chapter.getModuleId());
        dto.setDisplayOrder(chapter.getDisplayOrder());
        dto.setIsActive(chapter.getIsActive());
        dto.setCreatedAt(chapter.getCreatedAt());
        dto.setUpdatedAt(chapter.getUpdatedAt());
        
        // Map YouTube links
        if (chapter.getYoutubeLinks() != null) {
            List<String> youtubeUrls = chapter.getYoutubeLinks().stream()
                .map(ChapterYoutubeLink::getUrl)
                .collect(Collectors.toList());
            dto.setYoutubeLinks(youtubeUrls);
        }
        
        // Map uploaded files
        if (chapter.getUploadedFiles() != null) {
            List<String> filePaths = chapter.getUploadedFiles().stream()
                .map(ChapterUploadedFile::getFilePath)
                .collect(Collectors.toList());
            dto.setUploadedFiles(filePaths);
        }
        
        return dto;
    }
}
```

#### 6. Controller Layer

##### ChapterController
```java
@RestController
@RequestMapping("/api/admin/master-data/chapters")
@PreAuthorize("hasRole('ADMIN')")
public class ChapterController {

    @Autowired
    private ChapterService chapterService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createChapter(
            @RequestPart("chapter") String chapterJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {
        
        try {
            // Parse chapter JSON
            ObjectMapper objectMapper = new ObjectMapper();
            ChapterRequestDTO chapterRequest = objectMapper.readValue(chapterJson, ChapterRequestDTO.class);
            
            // Process uploaded files
            List<String> uploadedFilePaths = new ArrayList<>();
            if (files != null && !files.isEmpty()) {
                uploadedFilePaths = chapterService.saveUploadedFiles(files);
            }
            
            // Set uploaded file paths to chapter request
            chapterRequest.setUploadedFiles(uploadedFilePaths);
            
            // Create chapter
            ChapterResponseDTO createdChapter = chapterService.createChapter(chapterRequest);
            
            return ResponseEntity.ok(createdChapter);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to create chapter: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateChapter(
            @PathVariable Long id,
            @RequestPart("chapter") String chapterJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {
        
        try {
            // Parse chapter JSON
            ObjectMapper objectMapper = new ObjectMapper();
            ChapterRequestDTO chapterRequest = objectMapper.readValue(chapterJson, ChapterRequestDTO.class);
            
            // Process uploaded files
            List<String> uploadedFilePaths = new ArrayList<>();
            if (files != null && !files.isEmpty()) {
                uploadedFilePaths = chapterService.saveUploadedFiles(files);
            }
            
            // Set uploaded file paths to chapter request
            chapterRequest.setUploadedFiles(uploadedFilePaths);
            
            // Update chapter
            ChapterResponseDTO updatedChapter = chapterService.updateChapter(id, chapterRequest);
            
            return ResponseEntity.ok(updatedChapter);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to update chapter: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getChapterById(@PathVariable Long id) {
        try {
            ChapterResponseDTO chapter = chapterService.getChapterById(id);
            return ResponseEntity.ok(chapter);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to retrieve chapter: " + e.getMessage()));
        }
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<?> getChaptersByModule(
            @PathVariable Long moduleId,
            @RequestParam(required = false) Boolean isActive) {
        try {
            List<ChapterResponseDTO> chapters = chapterService.getChaptersByModule(moduleId, isActive);
            return ResponseEntity.ok(chapters);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to retrieve chapters: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllChapters(@RequestParam(required = false) Boolean isActive) {
        try {
            List<ChapterResponseDTO> chapters = chapterService.getAllChapters(isActive);
            return ResponseEntity.ok(chapters);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to retrieve chapters: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchChapters(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Boolean isActive) {
        try {
            List<ChapterResponseDTO> chapters = chapterService.searchChapters(searchTerm, moduleId, isActive);
            return ResponseEntity.ok(chapters);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to search chapters: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChapter(@PathVariable Long id) {
        try {
            chapterService.deleteChapter(id);
            return ResponseEntity.ok(Map.of("message", "Chapter deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to delete chapter: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateChapterStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        try {
            ChapterResponseDTO updatedChapter = chapterService.updateChapterStatus(id, isActive);
            return ResponseEntity.ok(updatedChapter);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to update chapter status: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/display-order")
    public ResponseEntity<?> updateChapterDisplayOrder(
            @PathVariable Long id,
            @RequestParam Integer displayOrder) {
        try {
            ChapterResponseDTO updatedChapter = chapterService.updateChapterDisplayOrder(id, displayOrder);
            return ResponseEntity.ok(updatedChapter);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to update chapter display order: " + e.getMessage()));
        }
    }
}
```

##### ChapterFileController
```java
@RestController
@RequestMapping("/api/admin/master-data/chapters")
public class ChapterFileController {

    @Value("${app.upload.dir:uploads/chapters}")
    private String uploadDir;

    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
```

#### 7. Configuration Classes

##### MultipartConfig
```java
@Configuration
public class MultipartConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // Set file size limits
        factory.setMaxFileSize(DataSize.ofMegabytes(10)); // 10MB per file
        factory.setMaxRequestSize(DataSize.ofMegabytes(50)); // 50MB total request size
        
        return factory.createMultipartConfig();
    }
}
```

##### WebConfig
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureMultipartResolver(MultipartResolver multipartResolver) {
        multipartResolver.setDefaultEncoding("UTF-8");
    }
}
```

#### 8. Application Properties
```properties
# File upload settings
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.file-size-threshold=2KB

# Upload directory
app.upload.dir=uploads/chapters

# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Security configuration
spring.security.user.name=admin
spring.security.user.password=admin123
```

### 🎯 Frontend Implementation

#### 1. Service Layer (masterDataService.js)
```javascript
// Master Data Management API Service
import { API_BASE } from '../config/apiConfig';

// Chapter Management Functions
export const createChapter = async (token, chapterData) => {
  try {
    const formData = new FormData();
    
    // Create chapter JSON object
    const chapterJson = {
      name: chapterData.name,
      description: chapterData.description,
      moduleId: chapterData.moduleId,
      displayOrder: chapterData.displayOrder || 0,
      isActive: chapterData.isActive !== false,
      youtubeLinks: chapterData.youtubeLinks || []
    };
    
    // Append chapter data as JSON string
    formData.append('chapter', JSON.stringify(chapterJson));
    
    // Add files if any
    if (chapterData.uploadedFiles && chapterData.uploadedFiles.length > 0) {
      const fileObjects = chapterData.uploadedFileObjects || {};
      chapterData.uploadedFiles.forEach(fileName => {
        const fileObject = fileObjects[fileName];
        if (fileObject) {
          formData.append('files', fileObject);
        }
      });
    }
    
    // Use XMLHttpRequest for multipart requests
    const response = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/chapters`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            resolve(responseData);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error occurred'));
      };
      
      xhr.send(formData);
    });
    
    return response;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const updateChapter = async (token, chapterId, chapterData) => {
  try {
    const formData = new FormData();
    
    // Create chapter JSON object
    const chapterJson = {
      name: chapterData.name,
      description: chapterData.description,
      moduleId: chapterData.moduleId,
      displayOrder: chapterData.displayOrder || 0,
      isActive: chapterData.isActive !== false,
      youtubeLinks: chapterData.youtubeLinks || []
    };
    
    // Append chapter data as JSON string
    formData.append('chapter', JSON.stringify(chapterJson));
    
    // Add files if any
    if (chapterData.uploadedFiles && chapterData.uploadedFiles.length > 0) {
      const fileObjects = chapterData.uploadedFileObjects || {};
      chapterData.uploadedFiles.forEach(fileName => {
        const fileObject = fileObjects[fileName];
        if (fileObject) {
          formData.append('files', fileObject);
        }
      });
    }
    
    // Use XMLHttpRequest for multipart requests
    const response = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${API_BASE}/chapters/${chapterId}`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            resolve(responseData);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error occurred'));
      };
      
      xhr.send(formData);
    });
    
    return response;
  } catch (error) {
    console.error('Error updating chapter:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const getChapterById = async (token, chapterId) => {
  try {
    const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const getChaptersByModule = async (token, moduleId, isActive = null) => {
  try {
    let url = `${API_BASE}/chapters/module/${moduleId}`;
    if (isActive !== null) {
      url += `?isActive=${isActive}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chapters by module:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const getAllChapters = async (token, isActive = null) => {
  try {
    let url = `${API_BASE}/chapters`;
    if (isActive !== null) {
      url += `?isActive=${isActive}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all chapters:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const searchChapters = async (token, searchTerm, moduleId = null, isActive = null) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (moduleId) params.append('moduleId', moduleId);
    if (isActive !== null) params.append('isActive', isActive);

    const response = await fetch(`${API_BASE}/chapters/search?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching chapters:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const deleteChapter = async (token, chapterId) => {
  try {
    const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting chapter:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const updateChapterStatus = async (token, chapterId, isActive) => {
  try {
    const response = await fetch(`${API_BASE}/chapters/${chapterId}/status?isActive=${isActive}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating chapter status:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};

export const updateChapterDisplayOrder = async (token, chapterId, displayOrder) => {
  try {
    const response = await fetch(`${API_BASE}/chapters/${chapterId}/display-order?displayOrder=${displayOrder}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating chapter display order:', error);
    throw new Error(`An unexpected error occurred: ${error.message}`);
  }
};
```

### 📊 API Endpoints Summary

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| POST | `/api/admin/master-data/chapters` | Create new chapter with files | `multipart/form-data` |
| PUT | `/api/admin/master-data/chapters/{id}` | Update chapter with files | `multipart/form-data` |
| GET | `/api/admin/master-data/chapters/{id}` | Get chapter by ID | `application/json` |
| GET | `/api/admin/master-data/chapters/module/{moduleId}` | Get chapters by module | `application/json` |
| GET | `/api/admin/master-data/chapters` | Get all chapters | `application/json` |
| GET | `/api/admin/master-data/chapters/search` | Search chapters | `application/json` |
| DELETE | `/api/admin/master-data/chapters/{id}` | Delete chapter | `application/json` |
| PATCH | `/api/admin/master-data/chapters/{id}/status` | Update chapter status | `application/json` |
| PATCH | `/api/admin/master-data/chapters/{id}/display-order` | Update display order | `application/json` |
| GET | `/api/admin/master-data/chapters/files/{filename}` | Download/serve file | `application/pdf` |

### 🔧 Testing with cURL

#### Create Chapter with Files
```bash
curl -X POST "http://localhost:8080/api/admin/master-data/chapters" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: multipart/form-data" \
  -F 'chapter={"name":"Intro to Linear Equations","description":"Basics","moduleId":5,"displayOrder":1,"isActive":true,"youtubeLinks":["https://youtu.be/abc123"]};type=application/json' \
  -F "files=@D:/docs/linear_equations_notes.pdf" \
  -F "files=@D:/docs/practice_problems.docx"
```

#### Update Chapter with Files
```bash
curl -X PUT "http://localhost:8080/api/admin/master-data/chapters/15" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: multipart/form-data" \
  -F 'chapter={"name":"Updated Chapter Name","description":"Updated description","moduleId":5,"displayOrder":1,"isActive":true,"youtubeLinks":["https://youtu.be/abc123"]};type=application/json' \
  -F "files=@D:/docs/new_document.pdf"
```

### 🚀 Deployment Checklist

- [ ] Configure database connection
- [ ] Set up file upload directory
- [ ] Configure security settings
- [ ] Set file size limits
- [ ] Test multipart form data endpoints
- [ ] Verify file serving endpoints
- [ ] Test error handling
- [ ] Configure logging
- [ ] Set up monitoring

### 🔍 Troubleshooting

#### Common Issues:

1. **Content-Type Boundary Error**: Ensure backend accepts multipart/form-data
2. **File Upload Size**: Check max file size configuration
3. **File Path Issues**: Verify upload directory permissions
4. **JSON Parsing**: Ensure chapter data is valid JSON
5. **Security**: Verify authentication and authorization

#### Error Responses:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Chapter or file not found
- `500 Internal Server Error`: Server-side error

This implementation provides a complete solution for Chapter Management with multipart form data support, including file uploads, YouTube links, and comprehensive CRUD operations.
