# User Management API Implementation Guide

## Overview
This guide provides a complete implementation for User Management API in Spring Boot, supporting user registration, authentication, role-based access control, and administrative user management features.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('ADMIN', 'INSTRUCTOR', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    profile_image_url VARCHAR(500) NULL,
    phone_number VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    address TEXT NULL,
    bio TEXT NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_enabled (enabled),
    INDEX idx_created_at (created_at)
);
```

## Entity Classes

### User Entity
```java
package com.coaxialacademy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.STUDENT;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(name = "account_non_expired", nullable = false)
    private Boolean accountNonExpired = true;
    
    @Column(name = "account_non_locked", nullable = false)
    private Boolean accountNonLocked = true;
    
    @Column(name = "credentials_non_expired", nullable = false)
    private Boolean credentialsNonExpired = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Size(max = 500, message = "Profile image URL must not exceed 500 characters")
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;
    
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    // Constructors
    public User() {}
    
    public User(String username, String email, String password, String firstName, String lastName, UserRole role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    
    public Boolean getAccountNonExpired() { return accountNonExpired; }
    public void setAccountNonExpired(Boolean accountNonExpired) { this.accountNonExpired = accountNonExpired; }
    
    public Boolean getAccountNonLocked() { return accountNonLocked; }
    public void setAccountNonLocked(Boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; }
    
    public Boolean getCredentialsNonExpired() { return credentialsNonExpired; }
    public void setCredentialsNonExpired(Boolean credentialsNonExpired) { this.credentialsNonExpired = credentialsNonExpired; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    // Utility methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
    
    public boolean isInstructor() {
        return role == UserRole.INSTRUCTOR;
    }
    
    public boolean isStudent() {
        return role == UserRole.STUDENT;
    }
}
```

### UserRole Enum
```java
package com.coaxialacademy.entity;

public enum UserRole {
    ADMIN("Administrator"),
    INSTRUCTOR("Instructor"),
    STUDENT("Student");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
```

## DTOs (Data Transfer Objects)

### UserRequest DTO
```java
package com.coaxialacademy.dto.request;

import jakarta.validation.constraints.*;
import com.coaxialacademy.entity.UserRole;

public class UserRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
    private Boolean enabled = true;
    
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;
    
    private String dateOfBirth;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
    
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
    
    // Constructors
    public UserRequest() {}
    
    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
```

### UserResponse DTO
```java
package com.coaxialacademy.dto.response;

import com.coaxialacademy.entity.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private UserRole role;
    private String roleDisplayName;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private String profileImageUrl;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String bio;
    
    // Constructors
    public UserResponse() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public String getRoleDisplayName() { return roleDisplayName; }
    public void setRoleDisplayName(String roleDisplayName) { this.roleDisplayName = roleDisplayName; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
```

### UserCountResponse DTO
```java
package com.coaxialacademy.dto.response;

public class UserCountResponse {
    
    private long totalUsers;
    private long adminCount;
    private long instructorCount;
    private long studentCount;
    private long activeUsers;
    private long inactiveUsers;
    
    // Constructors
    public UserCountResponse() {}
    
    public UserCountResponse(long totalUsers, long adminCount, long instructorCount, 
                           long studentCount, long activeUsers, long inactiveUsers) {
        this.totalUsers = totalUsers;
        this.adminCount = adminCount;
        this.instructorCount = instructorCount;
        this.studentCount = studentCount;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;
    }
    
    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    
    public long getAdminCount() { return adminCount; }
    public void setAdminCount(long adminCount) { this.adminCount = adminCount; }
    
    public long getInstructorCount() { return instructorCount; }
    public void setInstructorCount(long instructorCount) { this.instructorCount = instructorCount; }
    
    public long getStudentCount() { return studentCount; }
    public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
    
    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
    
    public long getInactiveUsers() { return inactiveUsers; }
    public void setInactiveUsers(long inactiveUsers) { this.inactiveUsers = inactiveUsers; }
}
```

## Repository Interface

### UserRepository
```java
package com.coaxialacademy.repository;

import com.coaxialacademy.entity.User;
import com.coaxialacademy.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find by username
    Optional<User> findByUsername(String username);
    
    // Find by email
    Optional<User> findByEmail(String email);
    
    // Check if username exists
    boolean existsByUsername(String username);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find by role
    List<User> findByRole(UserRole role);
    
    // Find by enabled status
    List<User> findByEnabled(Boolean enabled);
    
    // Find by role and enabled status
    List<User> findByRoleAndEnabled(UserRole role, Boolean enabled);
    
    // Search users by name or email
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchUsers(@Param("search") String search);
    
    // Find users with filters
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:enabled IS NULL OR u.enabled = :enabled) AND " +
           "(:search IS NULL OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findUsersWithFilters(@Param("role") UserRole role, 
                                   @Param("enabled") Boolean enabled, 
                                   @Param("search") String search, 
                                   Pageable pageable);
    
    // Count users by role
    long countByRole(UserRole role);
    
    // Count users by enabled status
    long countByEnabled(Boolean enabled);
    
    // Count users by role and enabled status
    long countByRoleAndEnabled(UserRole role, Boolean enabled);
    
    // Find users created after date
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    // Find users with last login after date
    List<User> findByLastLoginAtAfter(LocalDateTime date);
    
    // Find users who haven't logged in recently
    @Query("SELECT u FROM User u WHERE u.lastLoginAt IS NULL OR u.lastLoginAt < :date")
    List<User> findInactiveUsers(@Param("date") LocalDateTime date);
}
```

## Service Layer

### UserService
```java
package com.coaxialacademy.service;

import com.coaxialacademy.dto.request.UserRequest;
import com.coaxialacademy.dto.response.UserCountResponse;
import com.coaxialacademy.dto.response.UserResponse;
import com.coaxialacademy.entity.User;
import com.coaxialacademy.entity.UserRole;
import com.coaxialacademy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Create new user
    public UserResponse createUser(UserRequest userRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userRequest.getUsername());
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequest.getEmail());
        }
        
        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setRole(userRequest.getRole());
        user.setEnabled(userRequest.getEnabled() != null ? userRequest.getEnabled() : true);
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setAddress(userRequest.getAddress());
        user.setBio(userRequest.getBio());
        
        // Parse date of birth if provided
        if (userRequest.getDateOfBirth() != null && !userRequest.getDateOfBirth().isEmpty()) {
            try {
                LocalDate dateOfBirth = LocalDate.parse(userRequest.getDateOfBirth());
                user.setDateOfBirth(dateOfBirth);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date format for date of birth");
            }
        }
        
        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }
    
    // Get all users with pagination and filters
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(UserRole role, Boolean enabled, String search, Pageable pageable) {
        Page<User> users = userRepository.findUsersWithFilters(role, enabled, search, pageable);
        return users.map(this::convertToResponse);
    }
    
    // Get all users without pagination (for admin management)
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(UserRole role, Boolean enabled, String search) {
        List<User> users;
        
        if (role != null && enabled != null && search != null && !search.isEmpty()) {
            users = userRepository.findUsersWithFilters(role, enabled, search, Pageable.unpaged()).getContent();
        } else if (role != null && enabled != null) {
            users = userRepository.findByRoleAndEnabled(role, enabled);
        } else if (role != null) {
            users = userRepository.findByRole(role);
        } else if (enabled != null) {
            users = userRepository.findByEnabled(enabled);
        } else if (search != null && !search.isEmpty()) {
            users = userRepository.searchUsers(search);
        } else {
            users = userRepository.findAll();
        }
        
        return users.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Get user by ID
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return convertToResponse(user);
    }
    
    // Get user by username
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return convertToResponse(user);
    }
    
    // Update user
    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        // Check if username is being changed and if it already exists
        if (!user.getUsername().equals(userRequest.getUsername()) && 
            userRepository.existsByUsername(userRequest.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userRequest.getUsername());
        }
        
        // Check if email is being changed and if it already exists
        if (!user.getEmail().equals(userRequest.getEmail()) && 
            userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequest.getEmail());
        }
        
        // Update fields
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setRole(userRequest.getRole());
        user.setEnabled(userRequest.getEnabled());
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setAddress(userRequest.getAddress());
        user.setBio(userRequest.getBio());
        
        // Update password only if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        
        // Parse date of birth if provided
        if (userRequest.getDateOfBirth() != null && !userRequest.getDateOfBirth().isEmpty()) {
            try {
                LocalDate dateOfBirth = LocalDate.parse(userRequest.getDateOfBirth());
                user.setDateOfBirth(dateOfBirth);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date format for date of birth");
            }
        }
        
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    // Delete user
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    
    // Activate user
    public UserResponse activateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        user.setEnabled(true);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    // Deactivate user
    public UserResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        user.setEnabled(false);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    // Update last login time
    public void updateLastLogin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    // Get user counts
    @Transactional(readOnly = true)
    public UserCountResponse getUserCounts() {
        long totalUsers = userRepository.count();
        long adminCount = userRepository.countByRole(UserRole.ADMIN);
        long instructorCount = userRepository.countByRole(UserRole.INSTRUCTOR);
        long studentCount = userRepository.countByRole(UserRole.STUDENT);
        long activeUsers = userRepository.countByEnabled(true);
        long inactiveUsers = userRepository.countByEnabled(false);
        
        return new UserCountResponse(totalUsers, adminCount, instructorCount, 
                                   studentCount, activeUsers, inactiveUsers);
    }
    
    // Convert User entity to UserResponse DTO
    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setRoleDisplayName(user.getRole().getDisplayName());
        response.setEnabled(user.getEnabled());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setLastLoginAt(user.getLastLoginAt());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAddress(user.getAddress());
        response.setBio(user.getBio());
        return response;
    }
}
```

## Controller Layer

### UserController
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.UserRequest;
import com.coaxialacademy.dto.response.UserCountResponse;
import com.coaxialacademy.dto.response.UserResponse;
import com.coaxialacademy.entity.UserRole;
import com.coaxialacademy.service.UserService;
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
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // Get all users with filters and pagination
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserResponse> users = userService.getUsers(role, enabled, search, pageable);
        return ResponseEntity.ok(users);
    }
    
    // Get all users without pagination (for admin management)
    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String search) {
        
        List<UserResponse> users = userService.getAllUsers(role, enabled, search);
        return ResponseEntity.ok(users);
    }
    
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        UserResponse user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    // Create new user
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        UserResponse user = userService.createUser(userRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, 
                                                  @Valid @RequestBody UserRequest userRequest) {
        UserResponse user = userService.updateUser(id, userRequest);
        return ResponseEntity.ok(user);
    }
    
    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    // Activate user
    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User activated successfully");
        return ResponseEntity.ok(response);
    }
    
    // Deactivate user
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deactivated successfully");
        return ResponseEntity.ok(response);
    }
    
    // Get user counts
    @GetMapping("/count")
    public ResponseEntity<UserCountResponse> getUserCounts() {
        UserCountResponse counts = userService.getUserCounts();
        return ResponseEntity.ok(counts);
    }
}
```

### AuthController (for registration)
```java
package com.coaxialacademy.controller;

import com.coaxialacademy.dto.request.UserRequest;
import com.coaxialacademy.dto.response.UserResponse;
import com.coaxialacademy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // User registration
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRequest userRequest) {
        UserResponse user = userService.createUser(userRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("user", user);
        
        // In a real application, you would generate a JWT token here
        // response.put("token", jwtToken);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

## API Endpoints Summary

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/admin/users` | Get all users with filters and pagination | ADMIN |
| GET | `/api/admin/users/all` | Get all users without pagination | ADMIN |
| GET | `/api/admin/users/{id}` | Get user by ID | ADMIN |
| GET | `/api/admin/users/username/{username}` | Get user by username | ADMIN |
| POST | `/api/admin/users` | Create new user | ADMIN |
| PUT | `/api/admin/users/{id}` | Update user | ADMIN |
| DELETE | `/api/admin/users/{id}` | Delete user | ADMIN |
| PUT | `/api/admin/users/{id}/activate` | Activate user | ADMIN |
| PUT | `/api/admin/users/{id}/deactivate` | Deactivate user | ADMIN |
| GET | `/api/admin/users/count` | Get user statistics | ADMIN |
| POST | `/api/auth/register` | User registration | Public |

## Request/Response Examples

### Create User Request
```json
POST /api/admin/users
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "enabled": true,
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1995-05-15",
  "address": "123 Main St, City, State",
  "bio": "Student interested in learning new technologies"
}
```

### User Response
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "role": "STUDENT",
  "roleDisplayName": "Student",
  "enabled": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "lastLoginAt": null,
  "profileImageUrl": null,
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1995-05-15",
  "address": "123 Main St, City, State",
  "bio": "Student interested in learning new technologies"
}
```

### User Count Response
```json
{
  "totalUsers": 150,
  "adminCount": 3,
  "instructorCount": 25,
  "studentCount": 122,
  "activeUsers": 145,
  "inactiveUsers": 5
}
```

## Error Handling

### Global Exception Handler
```java
package com.coaxialacademy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }
}
```

## Implementation Notes

### Security Configuration
- All admin endpoints require ADMIN role
- Password encoding using BCrypt
- JWT token authentication (implement separately)
- CORS configuration for frontend integration

### Database Configuration
- Enable JPA auditing for created_at and updated_at
- Configure connection pooling
- Set up proper indexing for performance

### Validation
- Bean validation annotations on DTOs
- Custom validation for unique constraints
- Proper error handling and messages

### Performance Considerations
- Pagination for large user lists
- Database indexing on frequently queried fields
- Caching for user counts and statistics
- Lazy loading for related entities

This implementation provides a complete, production-ready User Management API that integrates seamlessly with the existing frontend components.
