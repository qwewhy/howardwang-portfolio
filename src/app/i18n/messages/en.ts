import type { SiteContent } from '../../../entities/content/types'

export const enContent: SiteContent = {
  locale: 'en',
  copy: {
    locale: 'en',
    localeLabel: 'English',
    switchLocaleLabel: 'Switch language',
    navigationLabel: 'Primary navigation',
    themeLabel: 'Theme',
    themeDarkLabel: 'Dark',
    themeLightLabel: 'Light',
    openMenuLabel: 'Open navigation',
    closeMenuLabel: 'Close navigation',
    menuLabel: 'Menu',
    closeLabel: 'Close',
    openProjectLabel: 'Details',
    enterSceneLabel: 'Enter scene',
    sceneReadyLabel: 'Scene ready',
    sceneLoadingLabel: 'Loading scene',
    sceneErrorLabel: 'Scene failed to load',
    scenePosterLabel: 'Project preview',
    scenePosterDescription: 'Click "Enter scene" to launch the interactive 3D preview.',
    chapterLabel: 'Chapters',
    techStackLabel: 'Tech stack',
    evidenceLabel: 'Evidence',
    metricsLabel: 'Key metrics',
    sourceLabel: 'Source',
    summaryLabel: 'Summary',
    nextProjectLabel: 'Next project',
    liveLabel: 'Live',
    researchLabel: 'Research',
    internshipLabel: 'Internship',
    unavailablePdfLabel: 'Full resume available upon email request.',
    footerText: 'Designed and built by Hongyuan Wang.',
    skipToContentLabel: 'Skip to content',
    loadingRouteLabel: 'Loading…',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'The page you are looking for does not exist.',
    backHomeLabel: 'Back to home',
    contributionsSuffix: 'contributions',
    tryLiveLabel: 'Launch now',
    livePreviewLabel: 'Live preview',
  },
  nav: {
    home: 'Home',
    work: 'Projects',
    about: 'About Me',
    resume: 'Resume',
    contact: 'Contact',
  },
  evidenceSources: {
    resume: 'Resume verified',
    userProvided: 'User provided project information',
    liveSite: 'Live site verified on 2026-03-10',
    githubScreenshot: 'From provided GitHub screenshot',
  },
  profile: {
    name: 'Hongyuan Wang',
    title: 'Full-Stack Creative Engineer',
    tagline: 'Full-Stack Creative Engineer',
    summary: 'Building intelligent web systems, spatial interfaces, and data-driven experiences.',
    location: 'Ultimo, Sydney',
    status: 'Australian permanent resident',
    links: [
      { label: 'Email', href: 'mailto:hw8545626@gmail.com' },
      { label: 'GitHub', href: 'https://github.com/qwewhy', external: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/HongyuanWang', external: true },
    ],
  },
  home: {
    hero: {
      eyebrow: 'Full-Stack Creative Engineer',
      title: 'Building 3D web tools, research platforms, and AI-driven products.',
      subtitle: 'Combining frontend architecture and real-time AI to deliver interactive spatial web experiences.',
      contributionYears: [
        { year: '2025', total: '536 contributions' },
        { year: '2026', total: '427 contributions' },
      ],
    },
    workIntro: {
      eyebrow: 'Selected Work',
      title: 'Representative projects that show how I build.',
      description: 'Spanning browser 3D tooling, research visualization, real-time AI product delivery, and broader frontend system work.',
    },
    metricsIntro: {
      eyebrow: 'GitHub activity',
      title: 'A visible record of ongoing build velocity.',
      description: 'Public commits from the last two years, expanded into their own section instead of being squeezed into the intro.',
    },
    capabilityIntro: {
      eyebrow: 'Skills',
      title: 'Frontend, 3D graphics, and AI integration capabilities.',
      description: 'Grouped by the kinds of systems I actually ship, so the technical coverage is easy to scan.',
    },
    aiUsageIntro: {
      eyebrow: 'AI-Driven Development',
      title: 'Expert at leveraging AI to accelerate engineering delivery.',
      description: 'Deep Vibe Coding practitioner with clear understanding of AI capability boundaries, turning AI tools into productivity multipliers.',
    },
    educationIntro: {
      eyebrow: 'Education',
      title: 'Academic training that supports complex product delivery.',
      description: 'Interactive media and computer science training, backed by strong results and shipped project work.',
    },
    contactIntro: {
      eyebrow: 'Contact',
      title: 'Open to frontend, creative web, and interactive product roles.',
      description: 'Reach out through any of the channels below.',
    },
  },
  work: {
    intro: {
      eyebrow: 'Projects',
      title: 'Projects that demonstrate real engineering depth.',
      description: 'Each project includes live demos, impact metrics, and interactive 3D previews.',
    },
  },
  about: {
    intro: {
      eyebrow: 'About',
      title: 'Where design, code, and spatial interaction intersect.',
      description: 'Frontend architecture, 3D graphics, and full-stack AI delivery — building products that are technically deep and visually clear.',
    },
  },
  resume: {
    intro: {
      eyebrow: 'Resume',
      title: 'Experience, education, and skills.',
      description: 'Full resume with references available upon request via email.',
    },
    summary:
      'High-achieving UTS Master of IT graduate with 2+ years of full-stack experience across React, Next.js, Spring Boot, Three.js, Shader work, and AI-enabled product development.',
    sections: [
      {
        title: 'Experience',
        entries: [
          {
            heading: 'Chemviz3d',
            subheading: 'UTS interdisciplinary research project · 2024.10 - 2026.01',
            detail: '3D Chemical Reaction Visualization Web Application developed with close collaboration across science faculty and deployed as a core educational tool.',
            bullets: [
              'Served 4,000+ undergraduate students.',
              'Collaborated with 10+ professors.',
              'Owned business analysis, UI/UX, solution design, feedback iteration, and code improvement.',
            ],
          },
          {
            heading: 'Virtual Coach',
            subheading: 'Full-time Intern · Full Stack Developer · 2025.07 - 2025.10',
            detail: 'Bank anti-fraud detection training system with real-time AI voice detection, RAG integration, and backend collaboration.',
            bullets: [
              'Built with Next.js and Spring Boot.',
              'Integrated Spring AI Alibaba with Qdrant.',
              'Used Netty-socketio and MongoDB for real-time system behavior.',
            ],
          },
        ],
      },
      {
        title: 'Education',
        entries: [
          {
            heading: 'University of Technology Sydney',
            subheading: 'Master of IT · Interactive Media · 2023.08 - 2025.06',
            detail: 'GPA 6.44 / 7, WAM 86, approximately Top 5% in UTS.',
            bullets: [
              'Two projects were invited to the school science and technology festival with Top 1 course scores.',
            ],
          },
          {
            heading: 'Northeastern University (China)',
            subheading: 'Computer Science and Technology · 2020.09 - 2024.06',
            detail: 'Project 985 / Double First-Class Initiative university.',
            bullets: [
              'China National College Entrance Examination score: 640 / 750, about Top 10% in Tianjin.',
              'Freshman Academic Excellence Scholarship.',
            ],
          },
        ],
      },
    ],
    skills: [
      { group: 'Frontend', items: ['React 18', 'Next.js', 'TypeScript', 'Three.js', 'GLSL', 'Vite', 'Webpack', 'React Router'] },
      { group: 'State & UI', items: ['Zustand', 'Tailwind CSS', 'Figma', 'ESLint', 'Prettier'] },
      { group: 'Backend & Data', items: ['Spring Boot 3', 'RESTful APIs', 'JWT', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch'] },
      { group: 'AI', items: ['Spring AI', 'Spring AI Alibaba', 'RAG', 'Qdrant', 'LLM workflows', 'WebMCP'] },
    ],
  },
  contact: {
    intro: {
      eyebrow: 'Contact',
      title: 'Get in touch.',
      description: 'Open to frontend, creative web, and interactive product opportunities. Feel free to reach out.',
    },
    note: 'For the full resume or direct phone contact, please send an email.',
    links: [
      { label: 'Email', href: 'mailto:hw8545626@gmail.com' },
      { label: 'GitHub', href: 'https://github.com/qwewhy', external: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/HongyuanWang', external: true },
    ],
  },
  education: [
    {
      institution: 'University of Technology Sydney',
      degree: 'Master of IT · Interactive Media',
      period: '2023.08 - 2025.06',
      highlights: ['GPA 6.44 / 7', 'WAM 86', 'About Top 5% in UTS', 'Two Top 1 projects invited to the school festival'],
      logo: 'logos/restricteduts-logoheader.svg',
    },
    {
      institution: 'Northeastern University (China)',
      degree: 'Computer Science and Technology',
      period: '2020.09 - 2024.06',
      highlights: ['Project 985 / Double First-Class Initiative', 'Freshman Academic Excellence Scholarship', 'Gaokao 640 / 750'],
      logo: 'logos/neu.png',
    },
  ],
  metrics: [
    { value: '4,000+', label: 'students reached', context: 'Chemviz3d deployed as a core educational tool for undergraduate teaching.', source: 'resume' },
    { value: '10+', label: 'professors collaborated', context: 'Shaped in close collaboration with science faculty at UTS.', source: 'resume' },
    { value: '20+', label: 'custom React hooks', context: 'Built for animation, themes, and reusable business logic.', source: 'resume' },
    { value: '10', label: 'languages supported', context: 'Chemviz3d includes multi-language support using react-i18next.', source: 'resume' },
    { value: 'Top 5%', label: 'UTS standing', context: 'GPA 6.44 / 7, WAM 86 at University of Technology Sydney.', source: 'resume' },
  ],
  capabilities: [
    { id: 'spatial-web', title: 'Spatial Web', description: 'Three.js, WebGL, shader-level understanding.', linkedProjects: ['dynagraphai', 'chemviz3d'] },
    { id: 'creative-tooling', title: 'Creative Tooling', description: 'Browser-native editor with hierarchy, inspector, and export.', linkedProjects: ['dynagraphai'] },
    { id: 'ui-systems', title: 'UI Systems', description: 'State-driven patterns, clean component boundaries.', linkedProjects: ['chemviz3d', 'dynagraphai'] },
    { id: 'frontend-architecture', title: 'Frontend Architecture', description: 'Typed content, lazy loading, modular scene adapters.', linkedProjects: ['chemviz3d', 'virtual-coach'] },
    { id: 'ai-integration', title: 'AI Integration', description: 'Prompt workflows, RAG, agent-driven features.', linkedProjects: ['dynagraphai', 'virtual-coach'] },
    { id: 'research-collaboration', title: 'Research Collaboration', description: 'Academic feedback to product decisions.', linkedProjects: ['chemviz3d'] },
    { id: 'performance-engineering', title: 'Performance Engineering', description: 'Fast first paint, deferred 3D, worker-aware builds.', linkedProjects: ['dynagraphai', 'chemviz3d', 'virtual-coach'] },
  ],
  projects: {
    dynagraphai: {
      slug: 'dynagraphai',
      title: 'DynagraphAI',
      role: 'AI-powered browser 3D engine',
      period: 'Live product',
      location: 'Public web deployment',
      summary: 'AI-powered Three.js sandbox — prompt to scene to exportable code, all in the browser.',
      badges: ['Live', 'Creative Tooling', 'Three.js'],
      metrics: [
        { value: 'Prompt', label: 'to scene flow', context: 'Describe once, generate instantly, and preview in real time.', source: 'userProvided' },
        { value: 'Zero setup', label: 'browser-native entry', context: 'Runs directly in the browser with WebGL and Three.js.', source: 'liveSite' },
        { value: 'WYSIWYG', label: 'viewport feedback', context: 'Code changes render directly in the interactive 3D viewport.', source: 'liveSite' },
      ],
      techStack: ['Three.js', 'WebGL', 'TypeScript', 'AI-assisted generation', 'Browser editor workflows'],
      links: [
        { label: 'Visit DynagraphAI', href: 'https://www.dynagraphai.com/', external: true },
        { label: 'Open editor', href: 'https://www.dynagraphai.com/editor', external: true },
      ],
      liveUrl: 'https://www.dynagraphai.com',
      evidenceSource: ['userProvided', 'liveSite'],
      poster: {
        title: 'Prompt-to-World Foundry',
        description: 'A browser workbench where prompts become scene graphs, panels stay legible, and code remains exportable.',
        accentWords: ['Prompt', 'Hierarchy', 'Viewport', 'Export'],
      },
      chapters: [
        {
          id: 'prompt-signal',
          eyebrow: 'Act I',
          title: 'Prompt Signal',
          summary: 'Natural language input producing controlled, inspectable Three.js output.',
          bullets: [
            'Turns descriptions into runnable Three.js code.',
            'Frames AI as acceleration, not replacement of authorship.',
            'Keeps the tool grounded in scene intent and iteration speed.',
          ],
        },
        {
          id: 'scene-graph-assembly',
          eyebrow: 'Act II',
          title: 'Scene Graph Assembly',
          summary: 'Hierarchy, inspector, and asset panels that define a productized creative tool.',
          bullets: [
            'The panel language proves productized UI thinking.',
            'The interface supports code inspection alongside scene editing.',
            'The workbench pattern differentiates it from simple demo generators.',
          ],
        },
        {
          id: 'viewport-export',
          eyebrow: 'Act III',
          title: 'Viewport to Export',
          summary: 'Live preview and code export that carry output into real workflows.',
          bullets: [
            'Interactive viewport reflects edits immediately.',
            'The generated output remains code, not an opaque artifact.',
            'The browser experience prioritizes fast entry and low friction.',
          ],
        },
      ],
    },
    chemviz3d: {
      slug: 'chemviz3d',
      title: 'Chemviz3d',
      role: 'UTS interdisciplinary research project',
      period: 'Browser Molecular Animation Engine',
      location: 'UTS Science Department collaboration',
      summary: '3D chemical reaction visualizer for UTS chemistry teaching upgrade.',
      badges: ['Research', 'Three.js', 'Education'],
      metrics: [
        { value: '4000+', label: 'chemistry undergrads using it', context: 'The deployed tool directly supported teaching at scale.', source: 'resume' },
        { value: '10+', label: 'professor collaborators', context: 'The project evolved through continuous interdisciplinary feedback.', source: 'resume' },
        { value: '20+', label: 'custom hooks', context: 'State and behavior were decomposed into reusable frontend modules.', source: 'resume' },
      ],
      techStack: ['Three.js', 'WebGL', 'WASM', 'Web Worker', 'Zustand', 'Tailwind CSS', 'AWS S3', 'Route 53', 'CloudFront'],
      links: [
        { label: 'Visit Chemviz3d', href: 'https://www.chemviz3d.com', external: true },
      ],
      liveUrl: 'https://www.chemviz3d.com',
      evidenceSource: ['resume'],
      poster: {
        title: 'Reactive Molecular Theater',
        description: 'A research-facing interface where chemistry data becomes a teachable spatial narrative.',
        accentWords: ['Molecule', 'Reaction', 'Timeline', 'Scale'],
      },
      chapters: [
        {
          id: 'molecule-assembly',
          eyebrow: 'Act I',
          title: 'Molecule Assembly',
          summary: 'Scientific data converted into interpretable 3D molecular structures.',
          bullets: [
            'Included 2D-to-3D molecular structure conversion work.',
            'Integrated chemistry data queries and import pipelines.',
            'Grounded the visual system in domain understanding.',
          ],
        },
        {
          id: 'reaction-timeline',
          eyebrow: 'Act II',
          title: 'Reaction Timeline',
          summary: 'Keyframe-driven animation turning motion into an explanatory layer.',
          bullets: [
            'Built keyframe-oriented management logic.',
            'Handled rotation and transformation data processing.',
            'Used reusable hooks to keep complexity controlled.',
          ],
        },
        {
          id: 'teaching-scale',
          eyebrow: 'Act III',
          title: 'Teaching at Scale',
          summary: 'Deployed to 4,000+ students with multilingual support and faculty collaboration.',
          bullets: [
            'Used across 4,000+ students.',
            'Collaborated with 10+ professors from the science department.',
            'Supported multilingual delivery and maintainable UI state architecture.',
          ],
        },
      ],
    },
    'virtual-coach': {
      slug: 'virtual-coach',
      title: 'Virtual Coach',
      role: 'Full-time intern · Full Stack Developer',
      period: '2025.07 - 2025.10',
      location: 'Cyberoo AI',
      summary: 'Bank anti-fraud training system with real-time AI voice detection and RAG integration.',
      badges: ['Internship', 'Realtime', 'AI Systems'],
      metrics: [
        { value: 'Realtime', label: 'voice detection flow', context: 'The product centered on immediate anti-fraud training feedback.', source: 'resume' },
        { value: 'RAG', label: 'knowledge integration', context: 'Spring AI Alibaba and Qdrant were used to support intelligent behavior.', source: 'resume' },
        { value: 'Full-stack', label: 'delivery scope', context: 'The work spanned frontend, backend integration, and system collaboration.', source: 'resume' },
      ],
      techStack: ['Next.js', 'Spring Boot', 'Spring AI Alibaba', 'Qdrant', 'Netty-socketio', 'MongoDB'],
      links: [],
      evidenceSource: ['resume'],
      poster: {
        title: 'Fraud Signal Control Room',
        description: 'A real-time product narrative focused on voice signals, risk nodes, and knowledge-assisted decision flows.',
        accentWords: ['Voice', 'Risk', 'RAG', 'Realtime'],
      },
      chapters: [
        {
          id: 'voice-pulse-field',
          eyebrow: 'Act I',
          title: 'Voice Pulse Field',
          summary: 'Live voice signal interpretation for real-time fraud detection training.',
          bullets: [
            'Real-time AI voice detection for banking fraud prevention training.',
            'Designed around low-latency user feedback.',
            'Interface language emphasizes monitoring and intervention.',
          ],
        },
        {
          id: 'risk-node-graph',
          eyebrow: 'Act II',
          title: 'Risk Node Graph',
          summary: 'Risk events mapped into an interactive, traceable graph structure.',
          bullets: [
            'Maps events, entities, and flags into interpretable structures.',
            'Supports monitoring-style interface composition.',
            'Bridges frontend clarity with backend event flow.',
          ],
        },
        {
          id: 'knowledge-orbit',
          eyebrow: 'Act III',
          title: 'Knowledge Orbit',
          summary: 'RAG and AI framework integration powering knowledge-assisted decisions.',
          bullets: [
            'Integrated Spring AI Alibaba and Qdrant.',
            'Used Netty-socketio for realtime data transmission.',
            'Used MongoDB for flexible system data storage.',
          ],
        },
      ],
    },
  },
  seo: {
    home: {
      title: 'Hongyuan Wang · Full-Stack Creative Engineer',
      description: 'Portfolio featuring DynagraphAI, Chemviz3d, and Virtual Coach — interactive 3D tools, research platforms, and AI product systems.',
    },
    work: {
      title: 'Work · Hongyuan Wang',
      description: 'Project index covering browser 3D tooling, research-driven interaction design, and realtime AI product systems.',
    },
    about: {
      title: 'About · Hongyuan Wang',
      description: 'Background and positioning of Hongyuan Wang — Full-Stack Creative Engineer.',
    },
    resume: {
      title: 'Resume · Hongyuan Wang',
      description: 'Experience, education, and skills of Hongyuan Wang — Full-Stack Creative Engineer.',
    },
    contact: {
      title: 'Contact · Hongyuan Wang',
      description: 'Contact Hongyuan Wang for frontend, creative web, and interactive product opportunities.',
    },
    projects: {
      dynagraphai: {
        title: 'DynagraphAI · Hongyuan Wang',
        description: 'AI-powered browser 3D engine with prompt-to-scene workflows, interactive viewport feedback, and exportable Three.js code.',
      },
      chemviz3d: {
        title: 'Chemviz3d · Hongyuan Wang',
        description: 'Research-facing 3D chemical reaction visualization web application used in teaching and built with a maintainable frontend architecture.',
      },
      'virtual-coach': {
        title: 'Virtual Coach · Hongyuan Wang',
        description: 'Realtime AI anti-fraud training system built with full-stack collaboration, signal flow design, and RAG-enhanced product behavior.',
      },
    },
  },
}
