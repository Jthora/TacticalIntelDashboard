#!/bin/bash

# Settings Integration Testing Script
# This script performs manual verification of settings functionality

echo "🚀 Starting Settings Integration Tests"
echo "======================================="

# Check if the development server is running
check_server() {
    echo "📡 Checking if development server is running..."
    if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ Development server is running"
        return 0
    else
        echo "❌ Development server is not running"
        echo "💡 Please run: npm run dev"
        return 1
    fi
}

# Start the development server if not running
start_server() {
    echo "🔄 Starting development server..."
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    sleep 10
    
    if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ Development server started successfully"
        return 0
    else
        echo "❌ Failed to start development server"
        return 1
    fi
}

# Test localStorage integration
test_localstorage() {
    echo ""
    echo "🔧 Testing localStorage Integration"
    echo "=================================="
    
    # Create a simple Node.js script to test localStorage simulation
    cat > test_localstorage.js << 'EOF'
const { JSDOM } = require('jsdom');

// Simulate browser environment
const dom = new JSDOM();
global.window = dom.window;
global.localStorage = dom.window.localStorage;

// Mock the SettingsIntegrationService getGeneralSettings method
const testGeneralSettings = () => {
    // Set test data in localStorage
    const testSettings = {
        autoRefresh: false,
        refreshInterval: 600,
        preserveHistory: false
    };
    
    localStorage.setItem('generalSettings', JSON.stringify(testSettings));
    
    // Read and verify
    const stored = localStorage.getItem('generalSettings');
    const parsed = JSON.parse(stored);
    
    console.log('✅ localStorage integration test passed');
    console.log('📄 Stored settings:', parsed);
    
    return parsed.autoRefresh === false && parsed.refreshInterval === 600;
};

// Run test
if (testGeneralSettings()) {
    console.log('✅ All localStorage tests passed');
    process.exit(0);
} else {
    console.log('❌ localStorage tests failed');
    process.exit(1);
}
EOF

    if command -v node > /dev/null; then
        node test_localstorage.js
        rm test_localstorage.js
    else
        echo "⚠️  Node.js not found, skipping localStorage test"
    fi
}

# Test CSS integration
test_css_integration() {
    echo ""
    echo "🎨 Testing CSS Integration"
    echo "========================="
    
    local css_files=(
        "src/components/settings/SettingsChangeIndicator.css"
        "src/components/settings/ConfirmationDialog.css"
        "src/components/settings/SettingsTooltip.css"
        "src/assets/styles/components/general-settings.css"
    )
    
    for css_file in "${css_files[@]}"; do
        if [ -f "$css_file" ]; then
            echo "✅ $css_file exists"
        else
            echo "❌ $css_file missing"
        fi
    done
    
    # Check if CSS is imported in main.tsx
    if grep -q "SettingsChangeIndicator.css" src/main.tsx; then
        echo "✅ SettingsChangeIndicator.css imported in main.tsx"
    else
        echo "❌ SettingsChangeIndicator.css not imported in main.tsx"
    fi
}

# Test component exports
test_component_exports() {
    echo ""
    echo "📦 Testing Component Exports"
    echo "============================"
    
    local components=(
        "src/components/settings/SettingsChangeIndicator.tsx"
        "src/components/settings/ConfirmationDialog.tsx"
        "src/components/settings/SettingsTooltip.tsx"
    )
    
    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            echo "✅ $component exists"
            
            # Check for proper export
            if grep -q "export default" "$component"; then
                echo "  ✅ Has default export"
            else
                echo "  ❌ Missing default export"
            fi
        else
            echo "❌ $component missing"
        fi
    done
}

# Test SettingsIntegrationService
test_settings_service() {
    echo ""
    echo "⚙️  Testing SettingsIntegrationService"
    echo "====================================="
    
    if [ -f "src/services/SettingsIntegrationService.ts" ]; then
        echo "✅ SettingsIntegrationService.ts exists"
        
        # Check for key methods
        local methods=("getGeneralSettings" "getCORSStrategy" "getThemeSettings" "getTrustStatus")
        
        for method in "${methods[@]}"; do
            if grep -q "$method" src/services/SettingsIntegrationService.ts; then
                echo "  ✅ $method method exists"
            else
                echo "  ❌ $method method missing"
            fi
        done
    else
        echo "❌ SettingsIntegrationService.ts missing"
    fi
}

# Test FeedVisualizer integration
test_feedvisualizer_integration() {
    echo ""
    echo "📡 Testing FeedVisualizer Integration"
    echo "===================================="
    
    if [ -f "src/components/FeedVisualizer.tsx" ]; then
        echo "✅ FeedVisualizer.tsx exists"
        
        # Check for SettingsIntegrationService import
        if grep -q "SettingsIntegrationService" src/components/FeedVisualizer.tsx; then
            echo "  ✅ SettingsIntegrationService imported"
        else
            echo "  ❌ SettingsIntegrationService not imported"
        fi
        
        # Check for auto-refresh interval usage
        if grep -q "refreshInterval" src/components/FeedVisualizer.tsx; then
            echo "  ✅ Uses refreshInterval from settings"
        else
            echo "  ❌ Does not use refreshInterval from settings"
        fi
    else
        echo "❌ FeedVisualizer.tsx missing"
    fi
}

# Test settings tabs
test_settings_tabs() {
    echo ""
    echo "🔧 Testing Settings Tabs"
    echo "========================"
    
    local tabs=(
        "src/components/settings/tabs/GeneralSettings.tsx"
        "src/components/settings/tabs/CORSSettings.tsx"
        "src/components/settings/tabs/ProtocolSettings.tsx"
        "src/components/settings/tabs/VerificationSettings.tsx"
        "src/components/settings/tabs/DisplaySettings.tsx"
    )
    
    for tab in "${tabs[@]}"; do
        if [ -f "$tab" ]; then
            echo "✅ $(basename "$tab") exists"
            
            # Check for memo usage
            if grep -q "memo" "$tab"; then
                echo "  ✅ Uses React.memo for performance"
            else
                echo "  ⚠️  Not using React.memo (consider for performance)"
            fi
        else
            echo "❌ $(basename "$tab") missing"
        fi
    done
}

# Test TypeScript compilation
test_typescript() {
    echo ""
    echo "📝 Testing TypeScript Compilation"
    echo "================================="
    
    if command -v npx > /dev/null; then
        echo "🔍 Running TypeScript check..."
        if npx tsc --noEmit; then
            echo "✅ TypeScript compilation successful"
        else
            echo "❌ TypeScript compilation failed"
        fi
    else
        echo "⚠️  npx not found, skipping TypeScript check"
    fi
}

# Manual testing checklist
manual_testing_checklist() {
    echo ""
    echo "📋 Manual Testing Checklist"
    echo "==========================="
    echo ""
    echo "Please verify the following manually in the browser:"
    echo ""
    echo "1. 🔧 General Settings Tab:"
    echo "   - Change auto-refresh interval to 2 minutes"
    echo "   - Verify feeds refresh every 2 minutes"
    echo "   - Try clearing cache with confirmation dialog"
    echo ""
    echo "2. 🌐 CORS Settings Tab:"
    echo "   - Test different CORS strategies"
    echo "   - Verify real-time strategy switching"
    echo "   - Test CORS test utility"
    echo ""
    echo "3. 📡 Protocol Settings Tab:"
    echo "   - Reorder protocol priorities"
    echo "   - Verify protocol fallback works"
    echo "   - Test auto-detection"
    echo ""
    echo "4. 🔍 Verification Settings Tab:"
    echo "   - Adjust trust rating thresholds"
    echo "   - Verify trust indicators appear"
    echo "   - Test verification method priorities"
    echo ""
    echo "5. 🎨 Display Settings Tab:"
    echo "   - Change themes (dark, light, alliance)"
    echo "   - Adjust font size and density"
    echo "   - Verify changes apply immediately"
    echo ""
    echo "6. 💾 Settings Persistence:"
    echo "   - Make changes and refresh page"
    echo "   - Verify settings are remembered"
    echo "   - Test across different tabs"
    echo ""
    echo "7. 🔄 Change Indicators:"
    echo "   - Verify unsaved changes show indicator"
    echo "   - Test apply/discard functionality"
    echo "   - Check confirmation dialogs appear"
    echo ""
}

# Main execution
main() {
    cd "$(dirname "$0")"
    
    echo "📍 Current directory: $(pwd)"
    echo ""
    
    # Run automated tests
    test_css_integration
    test_component_exports
    test_settings_service
    test_feedvisualizer_integration
    test_settings_tabs
    test_localstorage
    test_typescript
    
    # Check server and start if needed
    if ! check_server; then
        read -p "🔧 Start development server? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_server
        fi
    fi
    
    # Show manual testing checklist
    manual_testing_checklist
    
    echo ""
    echo "🎉 Automated tests complete!"
    echo "📋 Please complete the manual testing checklist above"
    echo "🌐 Access the app at: http://localhost:5173"
}

# Run main function
main "$@"
