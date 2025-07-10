# System Menu Dropdown

## 📋 Feature Overview

The System Menu Dropdown provides comprehensive system control access through a compact dropdown interface, consolidating advanced system functions into a single accessible menu without cluttering the ultra-narrow header space.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Consolidated Access**: Single point of access for all system functions
- **Space Efficiency**: Complex functionality without header space consumption
- **Quick Actions**: Rapid access to critical system operations
- **Administrative Control**: Centralized system management capabilities

## 🏗 Technical Implementation

### React State Management
```typescript
interface SystemMenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  category: 'view' | 'export' | 'system' | 'help';
  shortcut?: string;
}

const [showSystemMenu, setShowSystemMenu] = useState<boolean>(false);
const menuRef = useRef<HTMLDivElement>(null);

const systemMenuItems: SystemMenuItem[] = [
  {
    id: 'fullscreen',
    label: 'Fullscreen',
    icon: '⛶',
    action: () => toggleFullscreen(),
    category: 'view',
    shortcut: 'F11'
  },
  {
    id: 'export-all',
    label: 'Export All',
    icon: '📤',
    action: () => exportAllData(),
    category: 'export'
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: '🔧',
    action: () => openDiagnosticsPanel(),
    category: 'system'
  },
  {
    id: 'help',
    label: 'Help',
    icon: '?',
    action: () => openHelpPanel(),
    category: 'help',
    shortcut: 'F1'
  }
];

const toggleSystemMenu = () => {
  setShowSystemMenu(prev => !prev);
};

// Close menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowSystemMenu(false);
    }
  };

  if (showSystemMenu) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showSystemMenu]);
```

### Visual Component
```tsx
<div className="system-menu-container" ref={menuRef}>
  <button 
    className={`system-menu-btn ${showSystemMenu ? 'active' : ''}`}
    onClick={toggleSystemMenu}
    title="System Menu"
  >
    <span className="menu-icon">☰</span>
  </button>
  
  {showSystemMenu && (
    <div className="system-menu-dropdown">
      {Object.entries(
        systemMenuItems.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, SystemMenuItem[]>)
      ).map(([category, items]) => (
        <div key={category} className="menu-category">
          <div className="category-header">{category.toUpperCase()}</div>
          {items.map(item => (
            <button
              key={item.id}
              className="menu-item"
              onClick={() => {
                item.action();
                setShowSystemMenu(false);
              }}
              title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
              {item.shortcut && (
                <span className="item-shortcut">{item.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  )}
</div>
```

## 📊 Metrics & Analytics

### Menu Usage Patterns
- **Item Selection Frequency**: Most commonly used menu items
- **Category Preferences**: Most accessed menu categories
- **Session Usage**: Average menu interactions per session
- **Efficiency Impact**: Time saved through quick menu access
