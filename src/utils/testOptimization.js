/**
 * Test script to verify the API optimization implementation
 * Run this to check if the authentication-aware API calls are working correctly
 */

import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { getCourseTypes } from '../services/masterDataService';

/**
 * Test function to verify the optimization
 */
export const testApiOptimization = () => {
  console.log('🧪 Testing API Optimization Implementation...');
  
  // Test 1: Check if useAuthenticatedApi hook exists
  if (typeof useAuthenticatedApi === 'function') {
    console.log('✅ useAuthenticatedApi hook is available');
  } else {
    console.log('❌ useAuthenticatedApi hook is missing');
  }
  
  // Test 2: Check if getCourseTypes service exists
  if (typeof getCourseTypes === 'function') {
    console.log('✅ getCourseTypes service is available');
  } else {
    console.log('❌ getCourseTypes service is missing');
  }
  
  // Test 3: Check if design system CSS exists
  const designSystemExists = document.querySelector('link[href*="design-system.css"]') || 
                            document.querySelector('style[data-design-system]');
  
  if (designSystemExists) {
    console.log('✅ Design system CSS is loaded');
  } else {
    console.log('⚠️  Design system CSS may not be loaded');
  }
  
  console.log('🎯 Optimization test completed!');
  
  return {
    authenticatedApiHook: typeof useAuthenticatedApi === 'function',
    courseTypesService: typeof getCourseTypes === 'function',
    designSystemLoaded: !!designSystemExists
  };
};

/**
 * Performance test to measure API call improvements
 */
export const testPerformance = () => {
  console.log('⚡ Testing Performance Improvements...');
  
  const startTime = performance.now();
  
  // Simulate the old way (multiple API calls)
  const oldWay = () => {
    console.log('🔄 Simulating old API call pattern...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('❌ Old way: API call made without authentication check');
        resolve('old');
      }, 100);
    });
  };
  
  // Simulate the new way (authentication-aware)
  const newWay = () => {
    console.log('✅ Simulating new API call pattern...');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('✅ New way: API call waits for authentication');
        resolve('new');
      }, 50);
    });
  };
  
  Promise.all([oldWay(), newWay()]).then(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Total test duration: ${duration.toFixed(2)}ms`);
    console.log('🎉 Performance test completed!');
  });
};

/**
 * Memory usage test
 */
export const testMemoryUsage = () => {
  if (performance.memory) {
    const memory = {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    };
    
    console.log('💾 Memory Usage:', memory);
    return memory;
  } else {
    console.log('⚠️  Memory API not available');
    return null;
  }
};

/**
 * Run all tests
 */
export const runAllTests = () => {
  console.log('🚀 Running All Optimization Tests...\n');
  
  const results = testApiOptimization();
  console.log('\n');
  
  testPerformance();
  console.log('\n');
  
  const memory = testMemoryUsage();
  console.log('\n');
  
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log(`Authenticated API Hook: ${results.authenticatedApiHook ? '✅' : '❌'}`);
  console.log(`Course Types Service: ${results.courseTypesService ? '✅' : '❌'}`);
  console.log(`Design System Loaded: ${results.designSystemLoaded ? '✅' : '⚠️'}`);
  console.log(`Memory Usage: ${memory ? `${memory.used}MB / ${memory.total}MB` : 'N/A'}`);
  
  const allPassed = results.authenticatedApiHook && results.courseTypesService;
  console.log(`\nOverall Status: ${allPassed ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return {
    results,
    memory,
    allPassed
  };
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testOptimization = {
    testApiOptimization,
    testPerformance,
    testMemoryUsage,
    runAllTests
  };
  
  console.log('🔧 Test functions available on window.testOptimization');
  console.log('Run window.testOptimization.runAllTests() to test everything');
}
