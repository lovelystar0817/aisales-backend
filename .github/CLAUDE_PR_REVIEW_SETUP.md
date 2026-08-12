# Claude PR Review Setup & Best Practices

## 🚀 Quick Setup

1. **Add Anthropic API Key to GitHub Secrets**
   - Go to Settings → Secrets and variables → Actions
   - Add `ANTHROPIC_API_KEY` with your Claude API key

2. **Files Created**
   - `.github/workflows/claude-pr-review.yml` - GitHub Actions workflow
   - `.github/claude-pr-review-prompt.md` - Review prompt template

## 🎯 How to Improve the Review Process

### 1. **Customize the Prompt for Your Team**
Edit `.github/claude-pr-review-prompt.md` to:
- Add company-specific coding standards
- Include framework-specific patterns (e.g., Prudential sales frameworks)
- Define severity levels for your team
- Add checklist items specific to your deployment process

### 2. **Enhance the Workflow**

```yaml
# Add PR size limits
- name: Check PR size
  run: |
    LINES_CHANGED=$(git diff --numstat ${{ github.event.pull_request.base.sha }}...${{ github.event.pull_request.head.sha }} | awk '{sum+=$1+$2} END {print sum}')
    if [ $LINES_CHANGED -gt 500 ]; then
      echo "⚠️ Large PR detected ($LINES_CHANGED lines). Consider breaking into smaller PRs."
    fi

# Add specific file pattern checks
- name: Check sensitive files
  run: |
    if git diff --name-only ${{ github.event.pull_request.base.sha }}...${{ github.event.pull_request.head.sha }} | grep -E "(env|config|secret)"; then
      echo "🔍 Sensitive files changed. Extra review needed."
    fi
```

### 3. **Add Pre-Review Checks**

```yaml
# Run linting before Claude review
- name: Run linting
  run: |
    npm ci
    npm run lint
    npm run build
```

### 4. **Implement Review Caching**
For large codebases, cache common patterns:

```yaml
- name: Cache review patterns
  uses: actions/cache@v3
  with:
    path: .github/review-cache
    key: review-patterns-${{ hashFiles('src/**/*.ts') }}
```

### 5. **Create Review Templates**
Add specialized prompts for different PR types:

```markdown
# .github/claude-prompts/feature-review.md
# .github/claude-prompts/bugfix-review.md
# .github/claude-prompts/refactor-review.md
```

### 6. **Add Review Metrics**

```yaml
- name: Track review metrics
  run: |
    echo "Review completed at: $(date)" >> .github/review-metrics.log
    echo "PR #${{ github.event.pull_request.number }}" >> .github/review-metrics.log
```

## 📊 Best Practices

### 1. **PR Guidelines**
- Keep PRs under 400 lines for effective reviews
- Write descriptive PR titles and descriptions
- Link related issues in PR description
- Use conventional commits for better context

### 2. **Review Response**
- Address all critical issues before merging
- Document why you're skipping any suggestions
- Use Claude's feedback to improve code quality over time

### 3. **Cost Optimization**
- Use PR labels to skip reviews (e.g., `skip-claude-review`)
- Limit reviews to specific file patterns
- Set up review quotas if needed

### 4. **Security**
- Never commit API keys
- Use GitHub Secrets for all sensitive data
- Regularly rotate API keys
- Monitor API usage

## 🔧 Advanced Configuration

### Filter by File Types
```yaml
- name: Filter files for review
  run: |
    echo "REVIEW_FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }}...${{ github.event.pull_request.head.sha }} | grep -E '\.(ts|js)$' | tr '\n' ' ')" >> $GITHUB_ENV
```

### Add Multiple Review Passes
```yaml
- name: Security-focused review
  uses: anthropics/claude-code-base-action@beta
  with:
    prompt: "Focus only on security vulnerabilities in this PR"
    
- name: Performance review
  uses: anthropics/claude-code-base-action@beta
  with:
    prompt: "Analyze performance implications of these changes"
```

### Integration with Other Tools
```yaml
- name: Combine with ESLint
  run: |
    npm run lint:report > eslint-report.txt
    echo "ESLINT_REPORT=$(cat eslint-report.txt)" >> $GITHUB_ENV
```

## 🎨 Customization Ideas

1. **Domain-Specific Reviews**
   - Add prompts for sales methodology compliance
   - Check AI prompt engineering best practices
   - Validate LiveKit session handling

2. **Team-Specific Standards**
   - Enforce naming conventions
   - Check documentation requirements
   - Validate test coverage thresholds

3. **Automated Fixes**
   - Create follow-up PRs for simple fixes
   - Auto-format code before review
   - Generate missing tests

## 📈 Measuring Success

Track these metrics:
- Reduction in bugs reaching production
- Time saved in manual reviews
- Code quality improvements
- Developer satisfaction

## 🤝 Getting Help

- Check Claude API status: https://status.anthropic.com
- GitHub Actions docs: https://docs.github.com/actions
- Report issues in your team's Slack channel

Remember: Claude is a tool to augment, not replace, human code review. Always apply critical thinking to its suggestions.
