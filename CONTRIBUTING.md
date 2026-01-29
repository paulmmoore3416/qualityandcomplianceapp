# Contributing to MedTech Compliance Suite

First off, thank you for considering contributing to MedTech Compliance Suite! It's people like you that make this tool a great resource for the medical device manufacturing community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Documentation](#documentation)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Node version: [e.g., 20.10.0]
- App version: [e.g., 1.0.0]
- Browser (if web): [e.g., Chrome 120]

**Additional context**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

**Enhancement Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Mockups, examples, or other context.

**Regulatory Impact**
Does this affect compliance? Which standards?
```

### Contributing Code

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** - ensure all tests pass
4. **Document your changes** - update relevant documentation
5. **Submit a pull request** with a clear description

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Ollama (for AI features)

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/qualityandcomplianceapp.git
cd qualityandcomplianceapp

# 2. Add upstream remote
git remote add upstream https://github.com/paulmmoore3416/qualityandcomplianceapp.git

# 3. Install dependencies
npm install

# 4. Create feature branch
git checkout -b feature/your-feature-name

# 5. Start development server
npm run dev
```

### Project Structure

```
qualityandcomplianceapp/
├── src/
│   ├── components/       # React components
│   │   ├── views/        # Page-level components
│   │   ├── modals/       # Modal dialogs
│   │   └── ui/           # Reusable UI components
│   ├── stores/           # Zustand state management
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── data/             # Static data and configurations
├── electron/             # Electron main process
├── public/               # Static assets
└── resources/            # Compliance resources
```

---

## 📏 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` or proper types
- Enable strict mode in tsconfig.json

**Example:**

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Use TypeScript interfaces for props
- Follow single responsibility principle
- Use descriptive component names

**Example:**

```typescript
// ✅ Good
interface MetricCardProps {
  metric: Metric;
  value: number;
  onChange: (value: number) => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  value,
  onChange
}) => {
  // implementation
};

// ❌ Bad
export const Card = (props: any) => {
  // implementation
};
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MetricCard`, `LoginView` |
| Files | kebab-case | `metric-card.tsx`, `login-view.tsx` |
| Functions | camelCase | `calculateRisk`, `handleSubmit` |
| Constants | UPPER_CASE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `UserRole`, `MetricValue` |

### File Organization

```typescript
// 1. Imports - external first, then internal
import React, { useState } from 'react';
import { User } from '../types';

// 2. Types/Interfaces
interface Props {
  user: User;
}

// 3. Component
export const UserProfile: React.FC<Props> = ({ user }) => {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 5. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Group related classes logically
- Use custom CSS only when necessary
- Follow mobile-first responsive design

```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// ❌ Bad
<div className="flex p-4 items-center rounded-lg justify-between shadow-md bg-white hover:shadow-lg">
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive

### PR Title Format

```
[Type] Brief description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding or updating tests
- chore: Maintenance tasks
```

**Examples:**
- `[feat] Add supplier audit workflow`
- `[fix] Correct CAPA date calculation`
- `[docs] Update installation guide for Linux`

### PR Description Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed.

## Regulatory Impact
- [ ] No impact on compliance
- [ ] Affects ISO 13485 compliance
- [ ] Affects 21 CFR Part 11 compliance
- [ ] Requires validation

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks** - CI/CD runs tests and linting
2. **Code Review** - At least one maintainer reviews
3. **Testing** - Reviewer tests changes locally
4. **Approval** - Maintainer approves and merges
5. **Deployment** - Changes included in next release

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- metric-card.test.tsx
```

### Writing Tests

Use Vitest and React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('displays metric name and value', () => {
    const metric = { name: 'First Pass Yield', value: 95 };

    render(<MetricCard metric={metric} />);

    expect(screen.getByText('First Pass Yield')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('calls onChange when value is updated', () => {
    const handleChange = vi.fn();
    const metric = { name: 'FPY', value: 95 };

    render(<MetricCard metric={metric} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '97' } });

    expect(handleChange).toHaveBeenCalledWith(97);
  });
});
```

---

## 📖 Documentation

### Code Comments

```typescript
/**
 * Calculates the risk index based on ISO 14971 severity and probability.
 *
 * @param severity - Severity level (1-5)
 * @param probability - Probability level (1-5)
 * @returns Risk index (1-25) and risk level classification
 *
 * @example
 * const risk = calculateRiskIndex(4, 3);
 * // Returns: { index: 12, level: 'High' }
 */
export function calculateRiskIndex(
  severity: SeverityLevel,
  probability: ProbabilityLevel
): { index: number; level: RiskLevel } {
  // implementation
}
```

### README Updates

When adding features, update:
- Feature list in README.md
- Screenshots (if UI changes)
- Installation instructions (if setup changes)
- Configuration examples (if new config added)

---

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for their contributions
- Annual contributor acknowledgment

### Top Contributors

*(Coming soon)*

---

## 📞 Questions?

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bugs and feature requests
- **Email**: paulmmoore3416@gmail.com for private inquiries

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to MedTech Compliance Suite!**

Your efforts help improve quality and safety in medical device manufacturing worldwide.
