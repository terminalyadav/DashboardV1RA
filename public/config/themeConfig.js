// public/config/themeConfig.js
export const themeConfig = {
    // Primary Color Scheme
    colors: {
        primary: "#5D5FEF",        // Indigo - Interactive Primary
        primaryHover: "#4338ca",   // Darker Index
        secondary: "#10B981",      // Emerald - Success/Action
        accent: "#EC4899",         // Pink - Alerts/Highlights
        warning: "#F59E0B",        // Amber - Pending/Warnings
        
        // Backgrounds
        bgDarker: "#020203",       // Core App Background
        bgPanel: "rgba(10, 10, 14, 0.4)", // Card Base Background
        glassBorder: "rgba(255, 255, 255, 0.05)",
        glassBorderHover: "rgba(255, 255, 255, 0.15)",
        
        // Text
        textPrimary: "#FFFFFF",
        textMuted: "#A1A1AA"
    },
    
    // Glows and Accents
    glow: {
        indigo: "rgba(93, 95, 239, 0.4)",
        emerald: "rgba(16, 185, 129, 0.4)",
        pink: "rgba(236, 72, 153, 0.4)",
        amber: "rgba(245, 158, 11, 0.4)"
    },

    // Typography 
    typography: {
        fontFamilySans: "'Inter', sans-serif",
        fontFamilyHeading: "'Outfit', sans-serif",
        fontFamilyMono: "'JetBrains Mono', monospace",
        baseFontSize: "14px",      // e.g. for body/tables
        h1FontSize: "1.125rem",     // "Command Center" Header
        h2FontSize: "3rem"          // Hero Section Titles (Global Overview)
    }
};
