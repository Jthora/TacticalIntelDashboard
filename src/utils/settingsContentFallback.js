/**
 * This script ensures that settings tabs content is properly displayed
 * by checking if the Outlet content is empty and showing the fallback content if needed.
 */
document.addEventListener('DOMContentLoaded', function() {
  // Function to check if settings content is empty and show fallback if needed
  function checkSettingsContent() {
    // Only run this on the settings page
    if (!window.location.pathname.startsWith('/settings')) return;
    
    const settingsContent = document.querySelector('.settings-content');
    const fallbackContent = document.getElementById('fallback-content');
    
    if (settingsContent && fallbackContent) {
      // Count the number of non-fallback children that have content
      const nonFallbackChildren = Array.from(settingsContent.children)
        .filter(child => child.id !== 'fallback-content');
      
      const hasContent = nonFallbackChildren.length > 0 && 
                        nonFallbackChildren.some(child => child.innerHTML.trim() !== '');
      
      // If we have no content from the router, show the fallback
      fallbackContent.style.display = hasContent ? 'none' : 'block';
    }
  }
  
  // Check when the page loads
  setTimeout(checkSettingsContent, 100);
  
  // Check again when route changes
  window.addEventListener('popstate', function() {
    setTimeout(checkSettingsContent, 100);
  });
  
  // Also check whenever a navigation event happens (useful for programmatic navigation)
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    setTimeout(checkSettingsContent, 100);
  };
  
  // Also periodically check for the first few seconds after page load
  // This helps catch any late-rendering components
  let checkCount = 0;
  const checkInterval = setInterval(function() {
    checkSettingsContent();
    checkCount++;
    if (checkCount >= 10) {
      clearInterval(checkInterval);
    }
  }, 500);
});
