// public/config/dashboardConfig.js
export const dashboardConfig = {
  // Global Header
  title: "V1RA",
  subtitle: "",

  // Navigation
  nav: {
    intelligenceHub: "",
    globalOverview: "Overview",
    creatorsPipeline: "Creators Data",
    brandsPipeline: "Brands Data",
    engines: "Scrappers",
    afnanIgEngine: "AFNAN IG",
    afnanTkEngine: "AFNAN TIKTOK",
    localEngine: "SANJEEV IG",
    terminateSession: "Log Out",
    adminName: "Admin",
    adminRole: "System"
  },

  // View Headers
  headers: {
    global: {
      title: "Overview",
      subtitle: "",
      badge: "System Online"
    },
    creator: {
      title: "Creators Data",
      subtitle: ""
    },
    brand: {
      title: "Brands Data",
      subtitle: ""
    },
    afnanIg: {
      title: "AFNAN IG Operations",
      badge: ""
    },
    afnanTk: {
      title: "AFNAN TikTok Operations",
      badge: ""
    },
    local: {
      title: "Operations",
      badge: ""
    }
  },

  // Buttons
  buttons: {
    primary: "Start Scan",
    secondary: "Export Data",
    downloadFullCsv: "Download Full CSV",
    downloadDbExtract: "Download DB Extract",
    undoReplied: "Undo Replied",
    undoSent: "Undo Sent",
    replied: "Replied",
    markSent: "Mark Sent"
  },

  // Stats / KPIs
  stats: {
    global: {
      cloudExtraction: "Afnan scraper Email",
      cloudOutreached: "Outreached",
      localDiscovery: "Local Scraper — Discovery",
      localMongoRecords: "MongoDB Records"
    },
    creators: {
      totalFound: "Total Found",
      sent: "Sent",
      replied: "Replied",
      replyRate: "Reply Rate",
      outreachRate: "Outreach Rate",
      fromAfnanIg: "From AFNAN IG",
      fromAfnanTk: "From AFNAN TikTok",
      fromLocal: "From Local Scraper"
    },
    brands: {
      totalFound: "Total Found",
      sent: "Sent",
      replied: "Replied",
      replyRate: "Reply Rate",
      outreachRate: "Outreach Rate",
      fromAfnanIg: "From AFNAN IG",
      fromAfnanTk: "From AFNAN TikTok",
      fromLocal: "From Local Scraper"
    },
    afnanIg: {
      igAccounts: "IG Accounts",
      emailsFound: "Emails Found",
      hitRate: "Hit Rate",
      velocity: "14-Day Velocity"
    },
    afnanTk: {
      tkAccounts: "TikTok Accounts",
      emailsFound: "Emails Found",
      hitRate: "Hit Rate",
      velocity: "14-Day Velocity"
    },
    local: {
      visits: "Visits",
      processed: "Processed",
      extracted: "Extracted",
      jobs: "Jobs",
      pipeline: "Machine Learning Pipeline"
    }
  },

  // Inputs / Placeholders
  placeholders: {
    searchGlobal: "Search across all data...",
    searchCreators: "Search creators...",
    searchBrands: "Search brands...",
    queryDb: "Query DB...",
    mongoRegex: "MongoDB regex..."
  },

  // Section Titles
  sections: {
    systemHealth: "System Health",
    liveLog: "Live Intelligence Feed",
    creatorsDb: "Creators Database",
    brandsDb: "Brands Database",
    igDb: "Instagram DB Interface",
    tkDb: "TikTok DB Interface",
    mongoExtract: "Raw Mongo Extract",
    neuralLogs: "Neural Logs (Live)"
  },

  // Miscelaneous text
  misc: {
    syncing: "SYNCING",
    all: "All",
    instagram: "Instagram",
    tiktok: "TikTok",
    pending: "Pending",
    sent: "Sent",
    replied: "Replied",
    creators: "Creators",
    brands: "Brands",
    allNodes: "All Nodes"
  }
};
