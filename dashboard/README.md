# Permamind Dashboard

A comprehensive dashboard for monitoring and managing Permamind hubs, workflows, and the decentralized AI memory ecosystem.

## Features

- **Hub Discovery**: Discover and connect to Permamind hubs across the network
- **Workflow Management**: Monitor workflow performance, stages, and enhancements
- **Cross-Hub Discovery**: Find and learn from workflows in other hubs
- **Analytics**: Performance insights and ecosystem health metrics
- **Documentation**: Integrated documentation for Permamind features and APIs
- **Real-time Monitoring**: Live status updates and performance tracking

## Tech Stack

- **Frontend**: SvelteKit 5
- **Styling**: CSS with dark theme
- **Build**: Vite
- **Language**: TypeScript

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type checking
- `npm run lint` - Lint code
- `npm run format` - Format code

## Dashboard Sections

### Dashboard Home

- Network overview statistics
- Connected hubs status
- Workflow performance summary
- Quick action buttons

### Hubs

- Discover all available hubs
- View hub details and reputation
- Connect to new hubs
- Monitor hub activity

### Workflows

- List all workflows with filtering
- View workflow performance metrics
- Monitor execution status and stages
- Track enhancements and improvements

### Discovery

- Search workflows across the network
- Find workflows by capability or requirements
- View popular capabilities and trends
- Request enhancement patterns

### Analytics

- Performance trend analysis
- Workflow comparison metrics
- Enhancement effectiveness tracking
- Ecosystem health scoring

### Documentation

- Complete API reference
- Getting started guides
- Memory types and workflow system
- Cross-hub discovery documentation

## Integration with Permamind

This dashboard is designed to work with the Permamind MCP server and can:

- Connect to local and remote Permamind hubs
- Display real-time data from the Arweave-based memory system
- Facilitate cross-hub workflow discovery and collaboration
- Provide insights into the decentralized AI memory ecosystem

## Development

The dashboard is built with modularity in mind:

- `/src/routes/` - SvelteKit pages and routing
- `/src/lib/components/` - Reusable Svelte components
- `/src/app.css` - Global styles and theme
- `/static/` - Static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run check`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
