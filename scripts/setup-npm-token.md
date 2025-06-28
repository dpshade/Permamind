# NPM Token Setup Guide

To enable NPM publishing in the CI/CD pipeline, you need to set up an NPM access token.

## Steps to Create NPM Token

1. **Log in to NPM**
   - Go to https://www.npmjs.com/
   - Sign in to your account (or create one if needed)

2. **Generate Access Token**
   - Go to https://www.npmjs.com/settings/tokens
   - Click "Generate New Token"
   - Choose "Automation" token type (for CI/CD)
   - Copy the generated token

3. **Add Token to GitHub Secrets**
   - Go to your repository settings on GitHub
   - Navigate to "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your NPM token
   - Click "Add secret"

## Verification

After adding the NPM_TOKEN secret:

1. Push new commits to main branch
2. The release workflow will automatically publish to NPM
3. Check the workflow logs to confirm successful publishing

## Alternative: Manual Publishing

If you prefer to publish manually:

```bash
npm login
npm publish
```

## Package Scope

If publishing a scoped package (@username/package), ensure:

- Your NPM token has access to the scope
- The package.json name matches the scope
- You have publishing permissions for that scope
