import type { ProjectTemplate, GeneratedProject, ProjectFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class ProjectGenerator {
  private templates: ProjectTemplate[] = [
    {
      id: 'react-app',
      name: 'React Application',
      description: 'Modern React app with TypeScript and Tailwind',
      category: 'Frontend',
      icon: 'AppWindow',
      files: [],
      dependencies: ['react', 'react-dom', 'react-router-dom', 'tailwindcss'],
      devDependencies: ['@types/react', '@types/react-dom', 'typescript', 'vite'],
      scripts: { dev: 'vite', build: 'tsc && vite build', preview: 'vite preview' },
    },
    {
      id: 'nextjs-app',
      name: 'Next.js Application',
      description: 'Full-stack Next.js app with App Router',
      category: 'Fullstack',
      icon: 'Globe',
      files: [],
      dependencies: ['next', 'react', 'react-dom', 'tailwindcss'],
      devDependencies: ['@types/node', '@types/react', '@types/react-dom', 'typescript'],
      scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' },
    },
    {
      id: 'node-api',
      name: 'Node.js API',
      description: 'Express API with TypeScript',
      category: 'Backend',
      icon: 'Server',
      files: [],
      dependencies: ['express', 'cors', 'dotenv', 'helmet'],
      devDependencies: ['@types/express', '@types/cors', 'typescript', 'ts-node', 'nodemon'],
      scripts: { dev: 'nodemon src/index.ts', build: 'tsc', start: 'node dist/index.js' },
    },
    {
      id: 'flutter-app',
      name: 'Flutter Application',
      description: 'Cross-platform mobile app',
      category: 'Mobile',
      icon: 'Smartphone',
      files: [],
      dependencies: ['flutter', 'cupertino_icons'],
      devDependencies: [],
      scripts: { run: 'flutter run', build: 'flutter build' },
    },
    {
      id: 'react-native',
      name: 'React Native App',
      description: 'Mobile app with React Native',
      category: 'Mobile',
      icon: 'Smartphone',
      files: [],
      dependencies: ['react-native', 'react', '@react-navigation/native'],
      devDependencies: ['@types/react', '@types/react-native', 'typescript'],
      scripts: { start: 'react-native start', run: 'react-native run-android' },
    },
    {
      id: 'python-api',
      name: 'Python FastAPI',
      description: 'FastAPI backend with Python',
      category: 'Backend',
      icon: 'Server',
      files: [],
      dependencies: ['fastapi', 'uvicorn', 'pydantic', 'sqlalchemy'],
      devDependencies: ['pytest', 'black', 'mypy'],
      scripts: { dev: 'uvicorn main:app --reload', test: 'pytest' },
    },
    {
      id: 'electron-app',
      name: 'Electron Desktop App',
      description: 'Cross-platform desktop application',
      category: 'Desktop',
      icon: 'Monitor',
      files: [],
      dependencies: ['electron', 'react', 'react-dom'],
      devDependencies: ['@types/react', '@types/react-dom', 'typescript', 'electron-builder'],
      scripts: { dev: 'electron .', build: 'electron-builder', dist: 'electron-builder --publish=never' },
    },
    {
      id: 'chrome-extension',
      name: 'Browser Extension',
      description: 'Chrome/Firefox extension',
      category: 'Extension',
      icon: 'Puzzle',
      files: [],
      dependencies: [],
      devDependencies: ['typescript', 'webpack', 'web-ext'],
      scripts: { build: 'webpack --mode=production', dev: 'webpack --mode=development --watch' },
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'Marketing landing page with animations',
      category: 'Website',
      icon: 'Layout',
      files: [],
      dependencies: ['react', 'framer-motion', 'lucide-react'],
      devDependencies: ['@types/react', 'typescript', 'vite', 'tailwindcss'],
      scripts: { dev: 'vite', build: 'tsc && vite build' },
    },
    {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      description: 'Full-featured admin panel',
      category: 'Website',
      icon: 'LayoutDashboard',
      files: [],
      dependencies: ['react', 'recharts', 'lucide-react', 'react-router-dom'],
      devDependencies: ['@types/react', 'typescript', 'vite', 'tailwindcss'],
      scripts: { dev: 'vite', build: 'tsc && vite build' },
    },
    {
      id: 'ai-chat',
      name: 'AI Chat Application',
      description: 'Chat app with AI integration',
      category: 'AI',
      icon: 'MessageSquare',
      files: [],
      dependencies: ['react', 'axios', 'react-markdown', 'lucide-react'],
      devDependencies: ['@types/react', 'typescript', 'vite', 'tailwindcss'],
      scripts: { dev: 'vite', build: 'tsc && vite build' },
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Platform',
      description: 'Online store with cart and checkout',
      category: 'Fullstack',
      icon: 'ShoppingCart',
      files: [],
      dependencies: ['next', 'react', 'stripe', 'prisma', '@prisma/client'],
      devDependencies: ['@types/react', 'typescript', 'tailwindcss'],
      scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    },
    {
      id: 'blog',
      name: 'Blog Platform',
      description: 'Markdown blog with CMS',
      category: 'Website',
      icon: 'FileText',
      files: [],
      dependencies: ['next', 'react', 'gray-matter', 'remark', 'remark-html'],
      devDependencies: ['@types/react', 'typescript', 'tailwindcss'],
      scripts: { dev: 'next dev', build: 'next build' },
    },
    {
      id: 'portfolio',
      name: 'Portfolio Website',
      description: 'Personal portfolio with projects',
      category: 'Website',
      icon: 'User',
      files: [],
      dependencies: ['react', 'framer-motion', 'lucide-react'],
      devDependencies: ['@types/react', 'typescript', 'vite', 'tailwindcss'],
      scripts: { dev: 'vite', build: 'tsc && vite build' },
    },
  ];

  getTemplates(): ProjectTemplate[] {
    return this.templates;
  }

  getTemplatesByCategory(category: string): ProjectTemplate[] {
    return this.templates.filter((t) => t.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.templates.map((t) => t.category))];
  }

  generateProject(templateId: string, projectName: string): GeneratedProject {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);

    const files = this.generateFiles(template, projectName);
    const readme = this.generateReadme(template, projectName);
    const buildInstructions = this.generateBuildInstructions(template);
    const deployInstructions = this.generateDeployInstructions(template);

    return {
      id: uuidv4(),
      name: projectName,
      template: template.name,
      files,
      createdAt: new Date(),
      readme,
      buildInstructions,
      deployInstructions,
    };
  }

  private generateFiles(template: ProjectTemplate, projectName: string): ProjectFile[] {
    const files: ProjectFile[] = [];

    // Generate package.json
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: `${template.description}`,
        private: true,
        scripts: template.scripts,
        dependencies: template.dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
        devDependencies: template.devDependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
      }, null, 2),
    });

    // Generate README
    files.push({
      path: 'README.md',
      content: this.generateReadme(template, projectName),
    });

    // Generate basic source files based on template
    switch (template.id) {
      case 'react-app':
        files.push(
          { path: 'src/main.tsx', content: this.getReactMain() },
          { path: 'src/App.tsx', content: this.getReactApp() },
          { path: 'src/index.css', content: this.getTailwindCSS() },
          { path: 'index.html', content: this.getHTML(projectName) },
          { path: 'vite.config.ts', content: this.getViteConfig() },
          { path: 'tsconfig.json', content: this.getTSConfig() },
          { path: 'tailwind.config.js', content: this.getTailwindConfig() },
        );
        break;
      case 'node-api':
        files.push(
          { path: 'src/index.ts', content: this.getNodeAPI() },
          { path: 'src/routes/index.ts', content: this.getNodeRoutes(), isDirectory: false },
          { path: 'src/middleware/errorHandler.ts', content: this.getErrorHandler() },
          { path: 'tsconfig.json', content: this.getTSConfig() },
          { path: '.env.example', content: this.getEnvExample() },
        );
        break;
      case 'python-api':
        files.push(
          { path: 'main.py', content: this.getPythonAPI() },
          { path: 'requirements.txt', content: template.dependencies.join('\n') },
          { path: '.env.example', content: 'DATABASE_URL=sqlite:///app.db\nSECRET_KEY=your-secret-key' },
        );
        break;
      case 'flutter-app':
        files.push(
          { path: 'lib/main.dart', content: this.getFlutterMain() },
          { path: 'pubspec.yaml', content: this.getPubspec(projectName) },
        );
        break;
      case 'landing-page':
        files.push(
          { path: 'src/main.tsx', content: this.getReactMain() },
          { path: 'src/App.tsx', content: this.getLandingPage() },
          { path: 'src/index.css', content: this.getTailwindCSS() },
          { path: 'index.html', content: this.getHTML(projectName) },
          { path: 'vite.config.ts', content: this.getViteConfig() },
          { path: 'tailwind.config.js', content: this.getTailwindConfig() },
        );
        break;
      default:
        files.push(
          { path: 'src/main.tsx', content: this.getReactMain() },
          { path: 'src/App.tsx', content: this.getReactApp() },
          { path: 'src/index.css', content: this.getTailwindCSS() },
          { path: 'index.html', content: this.getHTML(projectName) },
          { path: 'vite.config.ts', content: this.getViteConfig() },
        );
    }

    return files;
  }

  private generateReadme(template: ProjectTemplate, projectName: string): string {
    return `# ${projectName}

${template.description}

## Features

- Modern tech stack
- Production-ready setup
- TypeScript support
- Optimized build configuration

## Getting Started

### Prerequisites

- Node.js 18+ (or Python 3.10+ for Python projects)
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Scripts

${Object.entries(template.scripts).map(([name, cmd]) => `- **${name}**: \\`${cmd}\\``).join('\n')}

## Tech Stack

${[...template.dependencies, ...template.devDependencies].map((dep) => `- ${dep}`).join('\n')}

## License

MIT
`;
  }

  private generateBuildInstructions(template: ProjectTemplate): string {
    return `## Build Instructions

1. Install dependencies: npm install
2. Build the project: npm run build
3. Output will be in the dist/ or build/ folder

For production deployment, ensure all environment variables are set.`;
  }

  private generateDeployInstructions(template: ProjectTemplate): string {
    return `## Deployment

### Vercel (Recommended for Frontend)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Docker
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Railway/Render
1. Connect GitHub repo
2. Set build command: npm run build
3. Set start command: npm start`;
  }

  // Template code generators
  private getReactMain(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  private getReactApp(): string {
    return `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Nexus AI Studio</h1>
        <p className="text-dark-400 mb-8">Your project is ready!</p>
        <button
          onClick={() => setCount(c => c + 1)}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
        >
          Count: {count}
        </button>
      </div>
    </div>
  );
}

export default App;`;
  }

  private getLandingPage(): string {
    return `import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Build Faster with AI
            </h1>
            <p className="text-xl text-dark-400 max-w-2xl mx-auto mb-8">
              Transform your ideas into production-ready applications with our intelligent development platform.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-dark-800 hover:bg-dark-700 rounded-xl font-semibold transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Optimized performance for blazing speed' },
            { icon: Shield, title: 'Secure by Default', desc: 'Enterprise-grade security built-in' },
            { icon: Globe, title: 'Global Scale', desc: 'Deploy anywhere in the world' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700/50"
            >
              <feature.icon className="w-10 h-10 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-dark-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;`;
  }

  private getTailwindCSS(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-dark-950 text-white antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }
}`;
  }

  private getHTML(projectName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
  }

  private getViteConfig(): string {
    return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'dist' },
});`;
  }

  private getTSConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  }

  private getTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b',
          900: '#0f172a', 950: '#020617',
        },
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985',
          900: '#0c4a6e', 950: '#082f49',
        }
      }
    },
  },
  plugins: [],
}`;
  }

  private getNodeAPI(): string {
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
  }

  private getNodeRoutes(): string {
    return `import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

router.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ]);
});

export default router;`;
  }

  private getErrorHandler(): string {
    return `import { Request, Response, NextFunction } from 'express';

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};`;
  }

  private getEnvExample(): string {
    return `PORT=3000
NODE_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key`;
  }

  private getPythonAPI(): string {
    return `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Nexus API", version="1.0.0")

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float

@app.get("/")
async def root():
    return {"message": "API is running!"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/items")
async def get_items():
    return [{"id": 1, "name": "Sample Item"}]

@app.post("/items")
async def create_item(item: Item):
    return {"id": 2, **item.dict()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;
  }

  private getFlutterMain(): string {
    return `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nexus App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nexus App'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: const Center(
        child: Text('Welcome to Nexus!'),
      ),
    );
  }
}`;
  }

  private getPubspec(projectName: string): string {
    return `name: ${projectName.toLowerCase().replace(/\s+/g, '_')}
description: ${projectName}
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`;
  }
}

export const projectGenerator = new ProjectGenerator();
