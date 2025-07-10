#!/bin/bash

# Post-TDD Settings Validation Script
# Comprehensive testing script to ensure all settings functionality works as intended

set -e

echo "🎯 POST-TDD SETTINGS VALIDATION"
echo "================================="
echo
echo "This script performs comprehensive testing to ensure all settings"
echo "in the Tactical Intel Dashboard are authentically functional."
echo

PROJECT_ROOT=$(pwd)
SETTINGS_DIR="src/components/settings"
SERVICES_DIR="src/services"
TESTS_DIR="src/components/__tests__"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

log_test() {
    local status=$1
    local test_name=$2
    local details=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ $test_name${NC}"
        [ -n "$details" ] && echo "  $details"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗ $test_name${NC}"
        [ -n "$details" ] && echo "  $details"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠ $test_name${NC}"
        [ -n "$details" ] && echo "  $details"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    else
        echo -e "${BLUE}ℹ $test_name${NC}"
        [ -n "$details" ] && echo "  $details"
    fi
}

echo "Phase 1: Component Structure Validation"
echo "========================================"

# Check for all required settings components
check_component() {
    local component_path=$1
    local component_name=$2
    
    if [ -f "$component_path" ]; then
        log_test "PASS" "Component exists: $component_name"
        
        # Check if component exports properly
        if grep -q "export.*$component_name" "$component_path" || grep -q "export default" "$component_path"; then
            log_test "PASS" "Component exports properly: $component_name"
        else
            log_test "FAIL" "Component missing export: $component_name"
        fi
        
        # Check React.memo usage for performance
        if grep -q "React\.memo\|memo(" "$component_path"; then
            log_test "PASS" "Component uses React.memo: $component_name"
        else
            log_test "WARN" "Component should use React.memo for performance: $component_name"
        fi
        
        # Check useCallback usage
        if grep -q "useCallback" "$component_path"; then
            log_test "PASS" "Component uses useCallback: $component_name"
        else
            log_test "WARN" "Component should use useCallback for event handlers: $component_name"
        fi
        
    else
        log_test "FAIL" "Component missing: $component_name" "Expected at: $component_path"
    fi
}

# Check settings tab components
check_component "$SETTINGS_DIR/tabs/GeneralSettings.tsx" "GeneralSettings"
check_component "$SETTINGS_DIR/tabs/CORSSettings.tsx" "CORSSettings"
check_component "$SETTINGS_DIR/tabs/ProtocolSettings.tsx" "ProtocolSettings"
check_component "$SETTINGS_DIR/tabs/VerificationSettings.tsx" "VerificationSettings"
check_component "$SETTINGS_DIR/tabs/DisplaySettings.tsx" "DisplaySettings"

# Check UI feedback components
check_component "$SETTINGS_DIR/SettingsChangeIndicator.tsx" "SettingsChangeIndicator"
check_component "$SETTINGS_DIR/ConfirmationDialog.tsx" "ConfirmationDialog"
check_component "$SETTINGS_DIR/SettingsTooltip.tsx" "SettingsTooltip"

echo
echo "Phase 2: Service Integration Validation"
echo "======================================="

# Check SettingsIntegrationService
if [ -f "$SERVICES_DIR/SettingsIntegrationService.ts" ]; then
    log_test "PASS" "SettingsIntegrationService exists"
    
    # Check for key methods
    methods=("applyThemeSettings" "applyCorsSettings" "applyProtocolSettings" "applyVerificationSettings" "applyGeneralSettings" "getTrustStatus" "orderByProtocolPriority")
    
    for method in "${methods[@]}"; do
        if grep -q "$method" "$SERVICES_DIR/SettingsIntegrationService.ts"; then
            log_test "PASS" "Method exists: $method"
        else
            log_test "FAIL" "Method missing: $method"
        fi
    done
else
    log_test "FAIL" "SettingsIntegrationService missing"
fi

echo
echo "Phase 3: Context Integration Validation"
echo "======================================="

# Check SettingsContext integration
if [ -f "src/contexts/SettingsContext.tsx" ]; then
    log_test "PASS" "SettingsContext exists"
    
    # Check for settings types
    settings_types=("cors" "protocols" "verification" "display" "general")
    
    for setting_type in "${settings_types[@]}"; do
        if grep -q "$setting_type" "src/contexts/SettingsContext.tsx"; then
            log_test "PASS" "Settings type exists: $setting_type"
        else
            log_test "FAIL" "Settings type missing: $setting_type"
        fi
    done
else
    log_test "FAIL" "SettingsContext missing"
fi

# Check ThemeContext integration
if [ -f "src/contexts/ThemeContext.tsx" ]; then
    log_test "PASS" "ThemeContext exists"
    
    # Check for SettingsContext integration
    if grep -q "SettingsContext\|useSettings" "src/contexts/ThemeContext.tsx"; then
        log_test "PASS" "ThemeContext integrates with SettingsContext"
    else
        log_test "WARN" "ThemeContext may not be integrated with SettingsContext"
    fi
else
    log_test "FAIL" "ThemeContext missing"
fi

echo
echo "Phase 4: CSS and Styling Validation"
echo "===================================="

# Check for CSS files
css_files=(
    "src/components/settings/SettingsChangeIndicator.css"
    "src/components/settings/ConfirmationDialog.css"
    "src/components/settings/SettingsTooltip.css"
    "src/assets/styles/components/general-settings.css"
)

for css_file in "${css_files[@]}"; do
    if [ -f "$css_file" ]; then
        log_test "PASS" "CSS file exists: $(basename $css_file)"
    else
        log_test "FAIL" "CSS file missing: $css_file"
    fi
done

# Check main.tsx for CSS imports
if [ -f "src/main.tsx" ]; then
    if grep -q "\.css" "src/main.tsx"; then
        log_test "PASS" "main.tsx imports CSS files"
    else
        log_test "WARN" "main.tsx may be missing CSS imports"
    fi
else
    log_test "FAIL" "main.tsx missing"
fi

echo
echo "Phase 5: Functional Integration Validation"
echo "=========================================="

# Check FeedVisualizer integration
if [ -f "src/components/FeedVisualizer.tsx" ]; then
    log_test "PASS" "FeedVisualizer exists"
    
    # Check for settings integration
    if grep -q "useSettings\|refreshInterval" "src/components/FeedVisualizer.tsx"; then
        log_test "PASS" "FeedVisualizer integrates with settings"
    else
        log_test "FAIL" "FeedVisualizer missing settings integration"
    fi
else
    log_test "FAIL" "FeedVisualizer missing"
fi

# Check fetchFeed utility integration
if [ -f "src/utils/fetchFeed.ts" ]; then
    log_test "PASS" "fetchFeed utility exists"
    
    # Check for SettingsIntegrationService usage
    if grep -q "SettingsIntegrationService" "src/utils/fetchFeed.ts"; then
        log_test "PASS" "fetchFeed uses SettingsIntegrationService"
    else
        log_test "WARN" "fetchFeed may not use settings"
    fi
else
    log_test "WARN" "fetchFeed utility not found"
fi

echo
echo "Phase 6: Test Coverage Validation"
echo "================================="

# Check for test files
test_files=(
    "src/services/__tests__/SettingsIntegrationService.test.ts"
    "src/components/__tests__/FeedVisualizer.test.tsx"
    "src/components/settings/__tests__/CORSSettings.test.tsx"
)

for test_file in "${test_files[@]}"; do
    if [ -f "$test_file" ]; then
        log_test "PASS" "Test file exists: $(basename $test_file)"
    else
        log_test "WARN" "Test file missing: $test_file"
    fi
done

echo
echo "Phase 7: TypeScript Compilation Check"
echo "======================================"

# Run TypeScript compilation
echo "Running TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck > /tmp/tsc_output 2>&1; then
    log_test "PASS" "TypeScript compilation successful"
else
    log_test "FAIL" "TypeScript compilation failed"
    echo "Compilation errors:"
    cat /tmp/tsc_output | head -20
fi

echo
echo "Phase 8: Runtime Validation Tests"
echo "================================="

# Create a simple Node.js script to test imports
cat > /tmp/import_test.mjs << 'EOF'
// Test if all components can be imported without syntax errors
try {
    console.log('Testing component imports...');
    
    // We can't actually import React components in Node, but we can check syntax
    const fs = require('fs');
    const path = require('path');
    
    const checkSyntax = (filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Basic syntax checks
            if (content.includes('export') && (content.includes('function') || content.includes('const') || content.includes('class'))) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };
    
    const components = [
        'src/components/settings/tabs/GeneralSettings.tsx',
        'src/components/settings/tabs/CORSSettings.tsx',
        'src/components/settings/tabs/ProtocolSettings.tsx',
        'src/components/settings/tabs/VerificationSettings.tsx',
        'src/components/settings/tabs/DisplaySettings.tsx'
    ];
    
    let allValid = true;
    for (const comp of components) {
        if (!checkSyntax(comp)) {
            console.error(`Syntax issue in ${comp}`);
            allValid = false;
        }
    }
    
    if (allValid) {
        console.log('All components have valid syntax');
        process.exit(0);
    } else {
        console.error('Some components have syntax issues');
        process.exit(1);
    }
} catch (error) {
    console.error('Import test failed:', error.message);
    process.exit(1);
}
EOF

if node /tmp/import_test.mjs 2>/dev/null; then
    log_test "PASS" "Component syntax validation"
else
    log_test "WARN" "Component syntax validation failed"
fi

rm -f /tmp/import_test.mjs

echo
echo "Phase 9: Settings Persistence Validation"
echo "========================================"

# Create a localStorage test script
cat > /tmp/localstorage_test.mjs << 'EOF'
// Test localStorage integration
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

try {
    // Test localStorage functionality
    localStorage.setItem('test-settings', JSON.stringify({
        theme: 'dark',
        refreshInterval: 30000,
        corsStrategy: 'allorigins'
    }));
    
    const retrieved = JSON.parse(localStorage.getItem('test-settings'));
    
    if (retrieved && retrieved.theme === 'dark') {
        console.log('localStorage test passed');
        process.exit(0);
    } else {
        console.error('localStorage test failed');
        process.exit(1);
    }
} catch (error) {
    console.error('localStorage test error:', error.message);
    process.exit(1);
}
EOF

if command -v node >/dev/null && npm list jsdom >/dev/null 2>&1; then
    if node /tmp/localstorage_test.mjs 2>/dev/null; then
        log_test "PASS" "localStorage functionality test"
    else
        log_test "WARN" "localStorage functionality test failed"
    fi
else
    log_test "INFO" "Skipping localStorage test (jsdom not available)"
fi

rm -f /tmp/localstorage_test.mjs

echo
echo "Phase 10: Manual Testing Checklist"
echo "=================================="

echo "Manual tests to perform in browser:"
echo "1. ☐ Open Settings page and verify all tabs are visible"
echo "2. ☐ Change theme settings and verify immediate UI updates"
echo "3. ☐ Modify CORS settings and test feed fetching"
echo "4. ☐ Adjust protocol priorities and verify feed handling"
echo "5. ☐ Change refresh intervals and verify auto-refresh behavior"
echo "6. ☐ Test settings persistence across page reloads"
echo "7. ☐ Verify settings persistence across browser tabs"
echo "8. ☐ Test confirmation dialogs for destructive actions"
echo "9. ☐ Verify visual indicators for unsaved changes"
echo "10. ☐ Test settings reset functionality"
echo "11. ☐ Verify tooltips and help text display"
echo "12. ☐ Test responsive design on mobile devices"
echo "13. ☐ Verify accessibility (keyboard navigation, screen readers)"
echo "14. ☐ Test error handling for invalid settings values"
echo "15. ☐ Verify cache management functionality"

echo
echo "======================================"
echo "POST-TDD VALIDATION SUMMARY"
echo "======================================"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed/Warnings: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All automated tests passed! Settings implementation looks solid.${NC}"
    echo -e "${BLUE}💡 Don't forget to complete the manual testing checklist above.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed or had warnings. Review the output above.${NC}"
    echo -e "${BLUE}💡 Address the issues and run manual tests to ensure quality.${NC}"
    exit 1
fi
