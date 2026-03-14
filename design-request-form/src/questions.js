export const QUESTIONS = [
  {
    id: 'welcome',
    type: 'welcome',
  },
  {
    id: 'contact',
    type: 'multi',
    fields: [
      {
        id: 'name',
        label: 'Your name',
        placeholder: 'Jane Smith',
        optional: false,
      },
      {
        id: 'email',
        label: 'Email address',
        placeholder: 'jane@example.com',
        inputType: 'email',
        optional: false,
      },
    ],
  },
  {
    id: 'business',
    type: 'multi',
    fields: [
      {
        id: 'businessName',
        label: 'Business name',
        placeholder: 'Acme Studio (leave blank if not applicable)',
        optional: true,
      },
      {
        id: 'businessDescription',
        label: 'What does your business do?',
        placeholder: 'Briefly describe what you do and who you serve',
        multiline: true,
        optional: false,
      },
    ],
  },
  {
    id: 'hasWebsite',
    label: 'Do you have an existing website?',
    type: 'choice',
    options: ['Yes', 'No'],
  },

  // ── Branch: has existing website ──────────────────────────────
  {
    id: 'websiteUrl',
    label: 'What is your current website URL?',
    type: 'text',
    placeholder: 'https://yourwebsite.com',
    optional: true,
    condition: (a) => a.hasWebsite === 'Yes',
  },
  {
    id: 'currentPlatform',
    label: 'What platform is your current website built on?',
    type: 'choice',
    options: ['WordPress', 'Squarespace', 'Wix', 'Webflow', 'Shopify', 'Cargo', 'Other'],
    condition: (a) => a.hasWebsite === 'Yes',
  },
  {
    id: 'currentPlatformOther',
    label: 'Which platform are you using?',
    type: 'text',
    placeholder: 'e.g. Framer, Ghost, Custom build…',
    optional: false,
    condition: (a) => a.hasWebsite === 'Yes' && a.currentPlatform === 'Other',
  },
  {
    id: 'keepPlatform',
    label: 'Would you like to continue using your current platform?',
    type: 'choice',
    options: ['Yes', 'No', 'Open to suggestions'],
    condition: (a) => a.hasWebsite === 'Yes',
  },

  // ── Branch: no existing website ───────────────────────────────
  {
    id: 'preferredPlatform',
    label: 'Is there a platform you would like to use?',
    type: 'choice',
    options: ['WordPress', 'Squarespace', 'Webflow', 'Shopify', 'Cargo', 'Other', 'No preference'],
    condition: (a) => a.hasWebsite === 'No',
  },
  {
    id: 'preferredPlatformOther',
    label: 'Which platform did you have in mind?',
    type: 'text',
    placeholder: 'e.g. Framer, Ghost, Custom build…',
    optional: false,
    condition: (a) => a.hasWebsite === 'No' && a.preferredPlatform === 'Other',
  },
  {
    id: 'platformBudget',
    label: 'Do you have a budget in mind for the platform?',
    sublabel: 'Some platforms have monthly fees — good to know upfront.',
    type: 'choice',
    options: ['Free only', 'Under $30/mo', '$30–$80/mo', 'Not sure'],
    condition: (a) => a.hasWebsite === 'No',
  },

  // ── Shared questions ──────────────────────────────────────────
  {
    id: 'purpose',
    label: 'What is the main purpose of this website or redesign?',
    type: 'text',
    multiline: true,
    placeholder: 'e.g. Generate leads, sell products, showcase my portfolio, build credibility…',
    optional: false,
  },
  {
    id: 'style',
    label: 'Describe your desired website style or brand personality.',
    sublabel: 'Think adjectives — minimal, bold, playful, editorial, warm, corporate…',
    type: 'text',
    multiline: true,
    placeholder: 'e.g. Clean and minimal, warm and approachable, dark and editorial',
    optional: false,
  },
  {
    id: 'inspiration',
    label: 'List any websites you admire for inspiration.',
    sublabel: 'Paste links, or just describe what you like about them. Optional.',
    type: 'text',
    multiline: true,
    placeholder: 'https://example.com — I love the layout\nhttps://another.com — great use of color',
    optional: true,
  },
  {
    id: 'brandAssets',
    label: 'Do you have logos, brand guides, or other design materials?',
    type: 'choice',
    options: ['Yes, I have everything', 'Partially', 'No, starting from scratch'],
  },
  {
    id: 'additionalInfo',
    label: 'Anything else I should know?',
    sublabel: 'Goals, constraints, timeline, budget — anything that feels relevant.',
    type: 'text',
    multiline: true,
    placeholder: 'Share whatever comes to mind…',
    optional: true,
  },
]
