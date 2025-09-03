# FibreFlow React Neon - Development Workflow Guide

## 🔄 Dual Environment Architecture

This project uses a **fork-based development strategy** to maintain clear separation between production and development environments.

### Repository Structure

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
├── Access: Full development access
└── Purpose: Active development, testing, and feature work
```

## 🏗️ Environment Setup

### 1. Repository Configuration

```bash
# Set development fork as origin
git remote set-url origin https://github.com/VeloF2025/FF_React_Neon_Hein_20250902.git

# Add production repo as upstream
git remote add upstream https://github.com/VelocityFibre/FF_React_Neon.git

# Verify remote configuration
git remote -v
# origin    https://github.com/VeloF2025/FF_React_Neon_Hein_20250902.git (fetch)
# origin    https://github.com/VeloF2025/FF_React_Neon_Hein_20250902.git (push)
# upstream  https://github.com/VelocityFibre/FF_React_Neon.git (fetch)
# upstream  https://github.com/VelocityFibre/FF_React_Neon.git (push)
```

### 2. Database Configuration

Update your `.env.local` file with the development database:

```env
# Development Database (Neon Child Branch)
DATABASE_URL="postgresql://neondb_owner:npg_pv5qhPy6uZBj@ep-lively-wave-a1vj6l2o-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NODE_ENV="development"
```

### 3. Dependencies and Validation

```bash
# Install dependencies
npm install

# Validate TypeScript compilation
npm run type-check

# Validate code quality
npm run lint

# Run test suite
npm run test

# Test database connection
npm run db:test
```

## 🚀 Development Workflow

### Daily Development Flow

1. **Start with Archon Integration**
   ```javascript
   // Check pending tasks
   archon:manage_task(action="list", project_id="ff-react-neon", filter_by="status", filter_value="todo")
   
   // Search for relevant patterns
   archon:perform_rag_query(query="feature implementation pattern", match_count=5)
   ```

2. **Sync with Production** (daily/weekly)
   ```bash
   # Fetch latest from production
   git fetch upstream
   
   # Merge production changes into development
   git checkout main
   git merge upstream/master
   
   # Push updated development branch
   git push origin main
   ```

3. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature-name
   
   # Update task status in Archon
   # archon:manage_task(action="update", task_id="task_id", update_fields={"status": "doing"})
   
   # Develop feature with quality checks
   npm run type-check  # Must pass with 0 errors
   npm run lint        # Must pass with 0 warnings
   npm run test        # Must maintain 95%+ coverage
   
   # Commit changes
   git add .
   git commit -m "feat: implement new feature"
   
   # Push feature branch
   git push origin feature/new-feature-name
   ```

4. **Quality Validation**
   ```bash
   # Pre-merge validation
   npm run type-check   # TypeScript errors = blocking
   npm run lint         # ESLint errors = blocking
   npm run test         # Coverage < 95% = review required
   npm run test:e2e     # Playwright failures = blocking
   npm run build        # Build failures = blocking
   ```

5. **Integration and Testing**
   ```bash
   # Merge to development main
   git checkout main
   git merge feature/new-feature-name
   
   # Test full integration
   npm run test:full
   
   # Update Archon task status
   # archon:manage_task(action="update", task_id="task_id", update_fields={"status": "done"})
   ```

### Production Deployment Flow

1. **Pre-production Validation**
   ```bash
   # Full test suite
   npm run test:all
   
   # E2E test suite
   npm run test:e2e
   
   # Performance validation
   npm run build && npm run preview
   ```

2. **Create Production PR**
   - Create PR from development fork to production repository
   - Include comprehensive testing results
   - Document all database changes needed
   - Provide rollback plan if needed

3. **Post-deployment**
   - Verify production deployment
   - Monitor for issues
   - Update Archon knowledge base with lessons learned

## 🗄️ Database Safety Practices

### Development Database (Child Branch)

- **Safe Testing**: All schema changes tested in isolation
- **Data Integrity**: Production data never affected by development
- **Migration Planning**: Document all changes for production deployment
- **Rollback Capability**: Easy revert to production state if needed

### Database Operations

```bash
# Test connection
npm run db:test

# Run development migrations
npm run db:migrate:dev

# Seed development data
npm run db:seed:dev

# Reset development database (if needed)
npm run db:reset:dev
```

## 🔍 Quality Gates

### Mandatory Validations (Zero Tolerance)

1. **TypeScript Compilation**: 0 errors allowed
2. **ESLint**: 0 errors, 0 warnings allowed
3. **Console Statements**: No console.log in production code
4. **Test Coverage**: Minimum 95% coverage
5. **E2E Tests**: All Playwright tests must pass
6. **Build**: Must compile successfully

### Validation Commands

```bash
# Enhanced validation (mandatory before commits)
node scripts/zero-tolerance-check.js

# Individual validations
npm run type-check
npm run lint
npm run test -- --coverage
npm run test:e2e
npm run build
```

## 🤖 Archon Integration Workflow

### Before Development
```javascript
// Required checks before starting any task
archon:manage_task(action="list", project_id="ff-react-neon", filter_by="status", filter_value="todo")
archon:perform_rag_query(query="[relevant feature/pattern]", match_count=5)
archon:search_code_examples(query="[implementation pattern]", match_count=3)
```

### During Development
```javascript
// Update task status when starting work
archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "doing"})

// Search for guidance during implementation
archon:perform_rag_query(query="[specific technical question]")

// Create tasks for discoveries
archon:manage_task(action="create", project_id="ff-react-neon", title="[new requirement]")
```

### After Completion
```javascript
// Mark task complete
archon:manage_task(action="update", task_id="[task_id]", update_fields={"status": "done"})

// Document learnings (manual process)
// Add new patterns to knowledge base for future reference
```

## 📋 Troubleshooting

### Repository Issues
```bash
# If remote URLs are incorrect
git remote set-url origin https://github.com/VeloF2025/FF_React_Neon_Hein_20250902.git
git remote set-url upstream https://github.com/VelocityFibre/FF_React_Neon.git

# If sync issues occur
git fetch --all
git reset --hard origin/main
```

### Database Connection Issues
```bash
# Test connection
npm run db:test

# If connection fails, verify .env.local settings
# Check Neon dashboard for child branch status
```

### Build/Compilation Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm tsconfig.tsbuildinfo
npm run type-check
```

## 🎯 Benefits of This Workflow

1. **Risk Mitigation**: Production never affected by development work
2. **Safe Testing**: Database changes tested in isolation
3. **Clean History**: Clear separation of development and production changes
4. **Easy Rollback**: Can quickly revert to stable production state
5. **Archon Integration**: Systematic task management and knowledge accumulation
6. **Quality Assurance**: Multiple validation gates prevent quality issues

---

**Last Updated**: 2025-09-02  
**Environment**: FibreFlow React Neon Development Fork  
**Archon Project ID**: ff-react-neon