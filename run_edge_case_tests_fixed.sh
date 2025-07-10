#!/bin/bash

# Edge Case Tests Runner
# This script runs all edge case and stability tests for the settings system

echo "🚀 Running Edge Case and Stability Tests..."
echo "=========================================="

# Set error handling
set -e

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Define test patterns for edge cases
EDGE_CASE_TESTS=(
    "src/tests/edge-cases/data-corruption.test.ts"
    "src/tests/edge-cases/network-performance.test.ts"
    "src/tests/edge-cases/input-validation-security.test.ts"
    "src/tests/edge-cases/browser-compatibility.test.ts"
    "src/tests/edge-cases/concurrent-operations.test.tsx"
    "src/tests/settings-edge-cases.test.ts"
)

# Function to run a specific test file
run_test_file() {
    local test_file="$1"
    echo "📝 Running: $test_file"
    
    if [ -f "$test_file" ]; then
        npm test -- "$test_file" --verbose --passWithNoTests
        if [ $? -eq 0 ]; then
            echo "✅ PASSED: $test_file"
        else
            echo "❌ FAILED: $test_file"
            return 1
        fi
    else
        echo "⚠️  SKIPPED: $test_file (file not found)"
    fi
    echo ""
}

# Run TypeScript compilation check
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed. Please fix errors before running tests."
    exit 1
fi
echo "✅ TypeScript compilation successful"
echo ""

# Run each edge case test file
echo "🧪 Running Edge Case Tests..."
failed_tests=()

for test_file in "${EDGE_CASE_TESTS[@]}"; do
    if ! run_test_file "$test_file"; then
        failed_tests+=("$test_file")
    fi
done

# Run all edge case tests together
echo "🔄 Running all edge case tests together..."
npm test -- --testPathPatterns="edge-cases|settings-edge-cases" --verbose --passWithNoTests

# Summary
echo "=========================================="
echo "📊 Test Summary:"

if [ ${#failed_tests[@]} -eq 0 ]; then
    echo "✅ All edge case tests passed!"
    echo "🎉 Settings system is stable and robust!"
else
    echo "❌ Some tests failed:"
    for failed_test in "${failed_tests[@]}"; do
        echo "   - $failed_test"
    done
    echo ""
    echo "Please fix the failing tests before proceeding."
    exit 1
fi

echo ""
echo "🔧 Additional Manual Testing Checklist:"
echo "1. Test settings persistence across browser sessions"
echo "2. Test settings in incognito/private mode"
echo "3. Test with browser storage disabled"
echo "4. Test rapid setting changes in UI"
echo "5. Test with multiple browser tabs open"
echo "6. Test network connectivity edge cases"
echo "7. Test with browser extensions that modify localStorage"
echo ""
echo "✨ Edge case testing complete!"
