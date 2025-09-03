# CLAUDE.md - FibreFlow React Neon Project

## 🌟 ARCHON INTEGRATION [ACTIVE - UPDATED 2025-09-02]

**Status**: Active with Development Environment Setup  
**Project ID**: `ff-react-neon`  
**Environment**: Fork-based Development with Database Branching

### 🔄 Development Environment Configuration

#### Repository Structure (UPDATED)
```
Production Environment:
├── Repository: https://github.com/VelocityFibre/FF_React_Neon.git
├── Branch: master
├── Database: Neon Main Branch (Production)
├── Access: Protected, production deployments only
└── Purpose: Stable, tested code for live application

Development Environment:
├── Repository: https://github.com/VeloF2025/FF_React_Neon_Hein_20250902
├── Branch: main
├── Database: Neon Child Branch (Development)
├── Connection: postgresql://neondb_owner:npg_pv5qhPy6uZBj@ep-lively-wave-a1vj6l2o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
├── Access: Full development access
└── Purpose: Active development, testing, and feature work
```

### 📋 MANDATORY WORKFLOW RULES (UPDATED)

#### Before Starting ANY Task:
```javascript
// ALWAYS execute these checks first:
1. Verify working in DEVELOPMENT fork (VeloF2025/FF_React_Neon_Hein_20250902)
2. Confirm DEVELOPMENT database connection (Neon child branch)
3. archon:manage_task(action="list", project_id="ff-react-neon", filter_by="status", filter_value="todo")
4. archon:perform_rag_query(query="[relevant feature/pattern]", match_count=5)
5. archon:search_code_examples(query="[implementation pattern]", match_count=3)
```

#### Environment Safety Validation:
```bash
# MANDATORY: Verify development environment before proceeding
git remote -v | grep VeloF2025  # Must show development fork
echo $DATABASE_URL | grep "ep-lively-wave"  # Must show development database

# BLOCKING: If either check fails, STOP and reconfigure environment
```

#### During Development:
```javascript
// Update task status immediately when starting:
archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "doing"})

// Search before implementing:
archon:perform_rag_query(query="[specific technical question]")

// Create tasks for discoveries:
archon:manage_task(action="create", project_id="ff-react-neon", title="[new requirement]")
```

#### After Completing Work:
```javascript
// Mark task complete:
archon:manage_task(action="update", task_id="[task_id]", update_fields={"status": "done"})

// Document learnings:
// Add to knowledge base if new patterns discovered
```

### 🛡️ Development Safety Protocols

#### Repository Safety
- **NEVER** commit directly to production repository
- **ALWAYS** work in development fork (VeloF2025/FF_React_Neon_Hein_20250902)
- **VERIFY** git remote origin points to development fork before any commits
- **SYNC** with production upstream regularly but carefully

#### Database Safety
- **NEVER** modify production database directly
- **ALWAYS** use development database (Neon child branch)
- **TEST** all schema changes in development environment first
- **DOCUMENT** all database changes for production migration planning

### 🔧 Environment Commands (UPDATED)

#### Setup Development Environment:
```bash
# Configure repository remotes
git remote set-url origin https://github.com/VeloF2025/FF_React_Neon_Hein_20250902.git
git remote add upstream https://github.com/VelocityFibre/FF_React_Neon.git

# Verify environment
git remote -v
npm run type-check
npm run lint
npm run test
```

#### Database Setup:
```bash
# Verify development database in .env.local
grep "ep-lively-wave" .env.local  # Must show development connection

# Test database connection
npm run db:test
npm run db:migrate  # If needed
npm run db:seed     # Development data
```

### 🎯 Quick Archon Commands

**Get all project tasks:**
```
Show me all Archon tasks for project ff-react-neon
```

**Search project knowledge:**
```
Search Archon for [topic] in project ff-react-neon
```

**Create new task:**
```
Create Archon task: [description] for project ff-react-neon
```

### 🚨 Critical Development Rules

1. **Environment Verification**: ALWAYS verify development environment before coding
2. **Repository Isolation**: NEVER mix development and production repositories
3. **Database Separation**: ALWAYS use development database for testing
4. **Archon Integration**: NEVER start tasks without checking Archon first
5. **Quality Gates**: ALWAYS pass all validation before commits
6. **Knowledge Updates**: ALWAYS update Archon with learnings

### 🔍 Project Context (UPDATED)

- **Type**: React/TypeScript Web Application with Neon Database
- **Framework**: Next.js/React with TailwindCSS and VelocityFibre theme
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Testing**: Vitest + React Testing Library + Playwright E2E
- **Development Model**: Fork-based with database branching for safety

### 📚 Documentation References

- **Development Workflow**: `dev-tools/documentation/DEVELOPMENT_WORKFLOW.md`
- **Project Configuration**: `dev-tools/documentation/ARCHON_PROJECT_CONFIG.json`
- **Legacy Task Tracking**: `dev-tools/documentation/ARCHON_TASK_UPDATE.json`

## 🎭 PLAYWRIGHT E2E/UI TESTING (MANDATORY)

**CRITICAL**: All UI testing must use Playwright MCP integration

### Automatic Testing Triggers
Playwright tests are MANDATORY after:
- UI component changes in development fork
- Feature completion in development environment
- Module implementation using development database
- Bug fixes (UI-related) before merging to main
- Before ANY deployment preparation
- Theme/styling updates

### Quick Commands
```javascript
// Run all tests in development environment
mcp_playwright:runTests()

// Run smoke tests only
mcp_playwright:runTests(grep="@smoke")

// Debug with UI
mcp_playwright:runTests(ui=true)

// Run specific file
mcp_playwright:runTests(file="tests/e2e/feature.spec.ts")
```

### Test Coverage Requirements (Development Focus)
- Navigation: All routes accessible in development environment
- Forms: Validation and submission with development database
- Data: Tables/lists render correctly with development data
- Auth: Login/logout flows work with development auth
- Responsive: Mobile/tablet/desktop on development server
- Themes: VelocityFibre theme applies correctly
- Errors: 404/500 handled gracefully in development

---

**Environment**: Fork-based Development Setup  
**Last Updated**: 2025-09-02  
**Archon Integration**: Active with dual-environment safety  
**Database Environment**: Neon Child Branch (Development)  
**Repository Environment**: VeloF2025/FF_React_Neon_Hein_20250902 (Development Fork)