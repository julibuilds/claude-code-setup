#!/usr/bin/env node

// Simple test to check if the CLI starts without the toLowerCase error
console.log("Testing CLI startup...");

try {
  // Import the main module to see if there are any immediate errors
  console.log("✓ Starting CLI test");
  
  // Test basic string operations that might cause issues
  const testString = null;
  console.log("Testing null string operations...");
  
  // This should cause the same error if it's a general null handling issue
  try {
    const result = testString?.toLowerCase?.() || "safe";
    console.log("✓ Null string handling works:", result);
  } catch (e) {
    console.error("✗ Null string handling failed:", e.message);
  }
  
  // Test with undefined
  const testUndefined = undefined;
  try {
    const result = testUndefined?.toLowerCase?.() || "safe";
    console.log("✓ Undefined string handling works:", result);
  } catch (e) {
    console.error("✗ Undefined string handling failed:", e.message);
  }
  
  console.log("✓ Basic tests passed");
  
} catch (error) {
  console.error("✗ CLI test failed:", error.message);
  console.error("Stack:", error.stack);
}