import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default tseslint.config(
  {
    // Expand ignores to prune archived/unwired areas during Phase 1 cleanup
    ignores: [
      'dist',
      // tests
      'src/tests/**',
      'tests/**',
      '**/*.test.*',
      '**/__tests__/**',
      // clearly unmounted feature areas
      'src/components/admin/**',
      'src/components/alerts/**',
      'src/components/DataExport/**',
      'src/components/debug/**',
      'src/components/ipfs/**',
      'src/components/incentives/**',
      'src/components/intelligence/**',
      'src/components/IntelSources/**',
      'src/components/micro-features/**',
      'src/components/missions/**',
      'src/components/monitoring/**',
      'src/components/TacticalFilters/**',
      // single-file components confirmed unimported
      'src/components/ExportPanel.tsx',
      'src/components/FeedList.tsx',
      'src/components/FeedModeSelector.tsx',
      'src/components/SourceInfo.tsx',
      'src/components/SystemPerformance.tsx',
      'src/components/SearchAndFilter.tsx',
      'src/components/feed/FeedSourceValidator.tsx',
      'src/components/governance/GovernancePage.tsx',
      'src/components/governance/ProposalCreationPanel.tsx',
      'src/components/governance/ProposalVotingPanel.tsx',
      // settings extras (keep SettingsTabContent/SettingsError active)
      'src/components/settings/index.ts',
      'src/components/settings/SettingsButton.tsx',
      'src/components/settings/SettingsModal.tsx',
      'src/components/settings/SettingsRouteValidator.tsx',
      'src/components/settings/SettingsTooltip.tsx',
      'src/components/settings/tabs/IntegrationSettings.tsx',
      // duplicated legacy pages
      'src/pages/GovernancePage.tsx',
      'src/pages/GovernancePanel.tsx',
      'src/pages/ProfilePage.tsx',
      'src/pages/Web3LoginPage.tsx',
      // alt architectures
      'src/features/**',
      'src/screens/**',
      // unmounted services/utilities
      'src/services/ConfigurationService.ts',
      'src/services/EventBusService.ts',
      'src/services/ExportService.ts',
      'src/services/IntelligenceBridge.ts',
      'src/services/IntelligencePriorityAssessor.ts',
      'src/services/RealTimeService.ts',
      'src/services/SettingsService.ts',
      'src/services/SourceVerificationService.ts',
      // assorted utils flagged as unimported
      'src/utils/alertValidation.ts',
      'src/utils/contentVerificationBatch.ts',
      'src/utils/contentVerificationUtils.ts',
      'src/utils/contractDeployment.ts',
      'src/utils/contractUtils.ts',
      'src/utils/encryptionUtils.ts',
      'src/utils/ensUtils.ts',
      'src/utils/IntegratedTestRunner.ts',
      'src/utils/ipfsPinningService.ts',
      'src/utils/mockData.ts',
      'src/utils/performanceUtils.ts',
      'src/utils/ProductionMonitoringSystem.ts',
      'src/utils/ProductionPerformanceMonitor.ts',
      'src/utils/ProductionTestingStrategy.ts',
      'src/utils/ResourceExhaustionPrevention.ts',
      'src/utils/rssUtils.ts',
      'src/utils/settingsContentFallback.js',
      'src/utils/StackOverflowPrevention.ts',
      'src/utils/UXFunctionalAuditor.ts',
      // web3 modules not wired into UI
      'src/web3/**',
      // misc
      'src/config/contracts.ts',
      'src/constants/SourceProtocolAdapter.ts',
      'src/constants/TacticalIntelSources.ts',
      'src/models/FeedList.ts',
      'src/models/FeedResults.ts',
      'src/jest.setup.js',
      'src/setupTests.ts',
      'src/styles/themes/**',
      'src/vite-env.d.ts',
      // local declaration shims
      'src/types/index.ts',
      'src/types/jest-dom.d.ts',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Unused imports/vars cleanup
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      // Deterministic import order
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },
)
