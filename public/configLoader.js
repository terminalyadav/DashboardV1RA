// public/configLoader.js
import { dashboardConfig } from './config/dashboardConfig.js';
import { themeConfig } from './config/themeConfig.js';

// Apply theme variables to CSS custom properties
function applyTheme() {
    const root = document.documentElement;
    const { colors, glow, typography } = themeConfig;

    if (colors) {
        root.style.setProperty('--bg-darker', colors.bgDarker);
        root.style.setProperty('--bg-panel', colors.bgPanel);
        root.style.setProperty('--glass-border', colors.glassBorder);
        root.style.setProperty('--glass-border-hover', colors.glassBorderHover);
        root.style.setProperty('--text-primary', colors.textPrimary);
        root.style.setProperty('--text-muted', colors.textMuted);
    }

    if (glow) {
        root.style.setProperty('--glow-indigo', glow.indigo);
        root.style.setProperty('--glow-emerald', glow.emerald);
        root.style.setProperty('--glow-pink', glow.pink);
        root.style.setProperty('--glow-amber', glow.amber);
    }
}

// Recursively search the nested config object by dot notation path
function getConfigValue(path, obj = dashboardConfig) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Apply text from config using data-config attributes
function applyTextContent() {
    // 1. Data-Config Attribute Elements (Best Practice)
    const configurableElements = document.querySelectorAll('[data-config]');
    
    configurableElements.forEach(el => {
        const configPath = el.getAttribute('data-config');
        const configValue = getConfigValue(configPath);
        
        if (configValue) {
            // Use innerText for most elements, placeholder for inputs
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', configValue);
            } else {
                // Ensure we don't wipe out inner elements (like icons) unless intended
                if (el.querySelector('.keep-icon')) {
                     const icon = el.querySelector('.keep-icon').outerHTML;
                     el.innerHTML = icon + ' ' + configValue;
                }
                else {
                    el.innerText = configValue;
                }
            }
        }
    });

}

// Make sure the config is applied when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyTextContent();
    console.log("v1ra configuration loaded successfully!");
});
