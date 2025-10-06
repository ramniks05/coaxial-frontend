/**
 * MIGRATION SCRIPT FOR COAXIAL ACADEMY OPTIMIZATION
 * 
 * This script helps migrate your existing components to the optimized version
 * Run this script to automatically update your imports and configurations
 */

import fs from 'fs';
import path from 'path';

// ===== MIGRATION CONFIGURATION =====
const MIGRATION_CONFIG = {
  // Files to update
  filesToUpdate: [
    'src/App.js',
    'src/index.js',
    'src/components/master-data/QuestionManagement.js'
  ],
  
  // Import mappings
  importMappings: {
    // Old imports -> New imports
    './components/master-data/QuestionManagement': './components/master-data/question/QuestionManagementOptimized',
    './MasterDataComponent.css': './styles/design-system.css'
  },
  
  // Component name mappings
  componentMappings: {
    'QuestionManagement': 'QuestionManagementOptimized'
  },
  
  // CSS class mappings
  cssClassMappings: {
    'btn-primary': 'btn btn-primary',
    'btn-secondary': 'btn btn-secondary',
    'btn-outline': 'btn btn-outline',
    'form-control': 'form-input',
    'form-group': 'form-group',
    'card': 'card',
    'card-header': 'card-header',
    'card-body': 'card-body',
    'table': 'table',
    'modal': 'modal',
    'alert': 'alert',
    'alert-success': 'alert alert-success',
    'alert-error': 'alert alert-error',
    'alert-warning': 'alert alert-warning',
    'alert-info': 'alert alert-info'
  }
};

// ===== MIGRATION FUNCTIONS =====

/**
 * Updates import statements in a file
 */
const updateImports = (filePath, content) => {
  let updatedContent = content;
  
  Object.entries(MIGRATION_CONFIG.importMappings).forEach(([oldImport, newImport]) => {
    const importRegex = new RegExp(`import.*from\\s*['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    updatedContent = updatedContent.replace(importRegex, (match) => {
      return match.replace(oldImport, newImport);
    });
  });
  
  return updatedContent;
};

/**
 * Updates component names in a file
 */
const updateComponentNames = (filePath, content) => {
  let updatedContent = content;
  
  Object.entries(MIGRATION_CONFIG.componentMappings).forEach(([oldName, newName]) => {
    // Update component usage
    const componentRegex = new RegExp(`<${oldName}\\b`, 'g');
    updatedContent = updatedContent.replace(componentRegex, `<${newName}`);
    
    // Update component closing tags
    const closingTagRegex = new RegExp(`</${oldName}>`, 'g');
    updatedContent = updatedContent.replace(closingTagRegex, `</${newName}>`);
  });
  
  return updatedContent;
};

/**
 * Updates CSS classes in a file
 */
const updateCSSClasses = (filePath, content) => {
  let updatedContent = content;
  
  Object.entries(MIGRATION_CONFIG.cssClassMappings).forEach(([oldClass, newClass]) => {
    // Update className attributes
    const classNameRegex = new RegExp(`className=["']([^"']*\\s)?${oldClass}(\\s[^"']*)?["']`, 'g');
    updatedContent = updatedContent.replace(classNameRegex, (match, before, after) => {
      const beforeStr = before || '';
      const afterStr = after || '';
      return `className="${beforeStr}${newClass}${afterStr}"`;
    });
  });
  
  return updatedContent;
};

/**
 * Migrates a single file
 */
const migrateFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent = originalContent;
    
    // Apply all migrations
    updatedContent = updateImports(filePath, updatedContent);
    updatedContent = updateComponentNames(filePath, updatedContent);
    updatedContent = updateCSSClasses(filePath, updatedContent);
    
    // Only write if content changed
    if (updatedContent !== originalContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
};

/**
 * Creates backup of original files
 */
const createBackup = (filePath) => {
  try {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`📁 Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Error creating backup for ${filePath}:`, error.message);
    return null;
  }
};

/**
 * Removes old CSS files
 */
const removeOldCSSFiles = () => {
  const oldCSSFiles = [
    'src/components/master-data/MasterDataComponent.css',
    'src/components/master-data/QuestionManagement.css'
  ];
  
  oldCSSFiles.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed old CSS file: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error removing ${filePath}:`, error.message);
    }
  });
};

/**
 * Validates the migration
 */
const validateMigration = () => {
  const validationResults = {
    success: true,
    errors: [],
    warnings: []
  };
  
  // Check if optimized components exist
  const requiredFiles = [
    'src/styles/design-system.css',
    'src/constants/index.js',
    'src/hooks/useApiCache.js',
    'src/hooks/useDebounce.js',
    'src/components/master-data/question/QuestionManagementOptimized.js',
    'src/components/master-data/question/QuestionFilters.js',
    'src/components/master-data/question/QuestionTable.js',
    'src/components/master-data/question/QuestionModal.js'
  ];
  
  requiredFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      validationResults.errors.push(`Missing required file: ${filePath}`);
      validationResults.success = false;
    }
  });
  
  // Check if main App.js has been updated
  try {
    const appContent = fs.readFileSync('src/App.js', 'utf8');
    if (!appContent.includes('QuestionManagementOptimized')) {
      validationResults.warnings.push('App.js may not be using the optimized component');
    }
  } catch (error) {
    validationResults.errors.push('Could not read App.js for validation');
    validationResults.success = false;
  }
  
  return validationResults;
};

/**
 * Main migration function
 */
const runMigration = () => {
  console.log('🚀 Starting Coaxial Academy Optimization Migration...\n');
  
  // Create backups
  console.log('📁 Creating backups...');
  MIGRATION_CONFIG.filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      createBackup(filePath);
    }
  });
  
  // Migrate files
  console.log('\n🔄 Migrating files...');
  let migratedCount = 0;
  MIGRATION_CONFIG.filesToUpdate.forEach(filePath => {
    if (migrateFile(filePath)) {
      migratedCount++;
    }
  });
  
  // Remove old CSS files
  console.log('\n🗑️  Cleaning up old files...');
  removeOldCSSFiles();
  
  // Validate migration
  console.log('\n✅ Validating migration...');
  const validation = validateMigration();
  
  // Print results
  console.log('\n📊 Migration Results:');
  console.log(`   Files migrated: ${migratedCount}`);
  console.log(`   Validation: ${validation.success ? 'PASSED' : 'FAILED'}`);
  
  if (validation.errors.length > 0) {
    console.log('\n❌ Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  if (validation.success) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test your application');
    console.log('   2. Update any remaining components to use the design system');
    console.log('   3. Remove unused dependencies');
    console.log('   4. Run performance tests');
  } else {
    console.log('\n❌ Migration completed with errors. Please review and fix the issues above.');
  }
};

// ===== EXPORT FOR USE =====
export {
  runMigration,
  migrateFile,
  updateImports,
  updateComponentNames,
  updateCSSClasses,
  validateMigration,
  MIGRATION_CONFIG
};

// ===== CLI USAGE =====
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}
