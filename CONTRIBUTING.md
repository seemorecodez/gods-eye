# Contributing to God's Eye

**Thanks for helping make God's Eye better!**

We're building the best free OSINT map tool on earth. Every contribution - code, documentation, bug reports, or plugin ideas - moves us closer to that goal.

---

## Quick Links

- 🐛 [Report a Bug](#reporting-bugs)
- 💡 [Suggest a Feature](#suggesting-features)
- 🔌 [Add a Plugin](#adding-plugins)
- 💻 [Submit Code](#submitting-code)
- 📖 [Improve Docs](#improving-documentation)

---

## Code of Conduct

**Be respectful. Be helpful. Be honest.**

This is an open-source tool, not a startup. We're here to build something useful together.

- Be constructive in feedback
- Help beginners learn
- Credit others' work
- Keep discussions on-topic

---

## Reporting Bugs

### Before Submitting
1. **Check if it's already reported** - Search [existing issues](../../issues)
2. **Verify it's actually a bug** - Try in incognito mode, different browser
3. **Gather info** - Browser, OS, steps to reproduce

### Create a Bug Report
[Open a new issue](../../issues/new?template=bug_report.md) with:

- **Title:** Clear, specific (e.g., "Flight markers not updating after refresh")
- **Description:** What happened vs. what should happen
- **Steps to reproduce:** Numbered list
- **Screenshots:** If visual issue
- **Browser/OS:** Version info
- **Console errors:** Open DevTools > Console, paste any red errors

**Good Bug Report Example:**
```markdown
## Bug: Weather overlay not loading

### Description
When I toggle "Weather" switch ON, nothing appears on the map. 
Console shows CORS error.

### Steps to Reproduce
1. Open God's Eye
2. Click "Weather" toggle in top-right
3. Wait 10 seconds
4. No markers appear

### Expected
Weather stations should appear as colored circles globally.

### Actual
No markers. Console error: "CORS policy blocked request to open-meteo.com"

### Environment
- Browser: Firefox 120
- OS: Windows 11
- Date: 2024-01-15
```

---

## Suggesting Features

### Before Suggesting
1. **Check if it's already suggested** - Search [discussions](../../discussions) and [issues](../../issues)
2. **Make sure it fits the mission** - We're building an OSINT map, not a general dashboard
3. **Consider if it could be a plugin** - New data sources = plugin, not core feature

### Create a Feature Request
[Open a discussion](../../discussions/new?category=ideas) with:

- **Title:** Specific goal (e.g., "Add historical playback for last 24 hours")
- **Problem:** What can't you do now?
- **Solution:** What would solve it?
- **Alternatives:** Other ways to achieve the same goal
- **Use case:** Real scenario where you'd use it

**Good Feature Request Example:**
```markdown
## Feature: Keyboard shortcuts for layer toggles

### Problem
I switch between flight/weather layers constantly. 
Clicking toggles breaks my flow.

### Solution
- `F` = toggle flights
- `W` = toggle weather
- `S` = toggle satellites
- `C` = toggle cameras

### Alternatives
- Command palette (Cmd+K)
- Customizable shortcuts in settings

### Use Case
I monitor airspace + weather together. Need to flip between 
layers 10+ times per session. Keyboard is way faster.
```

---

## Adding Plugins

**This is the #1 way to contribute!**

Every new data source makes God's Eye more useful.

### Quick Start
1. Read [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
2. Create your plugin file in `src/plugins/`
3. Test it locally
4. Open a PR

### Plugin PR Checklist
- [ ] Plugin file in `src/plugins/yourplugin.ts`
- [ ] Added to `src/plugins/index.ts`
- [ ] Includes JSDoc comments with author credit
- [ ] Free API (no required keys or paid tiers)
- [ ] Handles errors gracefully (returns `[]` on failure)
- [ ] Tested locally (markers appear, popups work, refreshes work)
- [ ] Added to plugin list in README
- [ ] Screenshot included in PR description

**See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) for detailed instructions.**

---

## Submitting Code

### Development Setup

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR-USERNAME/gods-eye.git
cd gods-eye

# Install dependencies
npm install

# Run locally
npm run dev

# Open http://localhost:5173
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b fix/your-bug-name
   # or
   git checkout -b feature/your-feature-name
   # or
   git checkout -b plugin/your-plugin-name
   ```

2. **Make your changes**
   - Keep changes focused (one issue per PR)
   - Follow existing code style
   - Test thoroughly locally

3. **Test your changes**
   ```bash
   # Run locally
   npm run dev
   
   # Build for production
   npm run build
   npm run preview
   
   # Check TypeScript
   npm run type-check
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "Fix: Weather overlay CORS issue"
   
   # Good commit messages:
   # Fix: [issue]
   # Add: [feature]
   # Update: [component/doc]
   # Remove: [unused code]
   # Refactor: [what you cleaned up]
   ```

5. **Push and open PR**
   ```bash
   git push origin your-branch-name
   ```
   Then open a PR on GitHub.

### Code Style

We're not strict, but follow these basics:

**TypeScript:**
- Use TypeScript, not JavaScript
- Type all function parameters and returns
- Prefer interfaces over types for objects
- Use `const` over `let` when possible

**React:**
- Functional components only
- Use hooks (`useState`, `useEffect`, `useKV`)
- Keep components focused and small
- Extract reusable logic to custom hooks

**Naming:**
- `camelCase` for variables and functions
- `PascalCase` for components and types
- `kebab-case` for files and IDs
- Be descriptive (`fetchWeatherData` > `getData`)

**Comments:**
- Don't comment obvious code
- Do comment complex logic or workarounds
- Add JSDoc for exported functions/types

**Example:**
```typescript
import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

interface UserPreferences {
  defaultLayers: string[]
  refreshInterval: number
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useKV<UserPreferences>('user-preferences', {
    defaultLayers: ['flights', 'weather'],
    refreshInterval: 60
  })
  
  const updateLayer = (layer: string, enabled: boolean) => {
    setPrefs(current => ({
      ...current,
      defaultLayers: enabled 
        ? [...current.defaultLayers, layer]
        : current.defaultLayers.filter(l => l !== layer)
    }))
  }
  
  return { prefs, updateLayer }
}
```

### Pull Request Process

1. **Fill out the PR template**
   - What does this change?
   - Why is it needed?
   - How did you test it?

2. **Link related issues**
   ```markdown
   Fixes #123
   Closes #456
   Related to #789
   ```

3. **Wait for review**
   - We respond within 24 hours
   - Address feedback promptly
   - Be open to suggestions

4. **After approval**
   - We'll merge your PR
   - Your contribution goes live immediately
   - You get credit in git history + release notes

---

## Improving Documentation

**Great docs make the project accessible.**

### What Needs Docs
- Getting started guides
- API usage examples
- Plugin tutorials
- Troubleshooting tips
- Use case walkthroughs

### How to Contribute Docs

1. **Find what to improve**
   - Read through existing docs
   - Note confusing parts
   - Try following a guide, see where you get stuck

2. **Make it better**
   - Clarify confusing language
   - Add missing steps
   - Include screenshots
   - Provide examples

3. **Submit PR**
   - Same process as code
   - Docs changes are fast to review
   - Merged quickly

---

## Good First Issues

New to the project? Start here:

### For Code
- [ ] Add keyboard shortcuts for layer toggles
- [ ] Improve mobile responsiveness
- [ ] Add loading states to markers
- [ ] Fix marker clustering on zoom out
- [ ] Add "Share current view" URL generation

### For Plugins
- [ ] Lightning strikes (Blitzortung.org)
- [ ] Ocean buoys (NOAA)
- [ ] Air quality (OpenAQ)
- [ ] Wildfires (NASA FIRMS)
- [ ] Radio towers (OpenCellID)

### For Docs
- [ ] Video tutorial for adding a plugin
- [ ] Troubleshooting guide
- [ ] Mobile usage tips
- [ ] API rate limit guide
- [ ] Example use cases with screenshots

[Browse all good first issues →](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

---

## Questions?

- 💬 [Discussions](../../discussions) - General questions, ideas
- 🐛 [Issues](../../issues) - Bugs, feature requests
- 📧 Email: [your email]

---

## Recognition

**Every contributor gets credit:**

- Name in git history
- Listed in release notes
- Added to [Contributors](../../graphs/contributors)
- Optional: Personal link in plugin attribution

**Top contributors** (5+ merged PRs) get:
- Highlighted in README
- Early access to new features
- Input on roadmap decisions

---

**Thanks for contributing! 🙌**
