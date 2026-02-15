# PWA Builder - Create Your Apps Like Glide

A powerful Progressive Web App builder that lets you create data apps, forms, websites, and embedded content - all without coding. Similar to Glide Apps but open source and self-hostable.

![PWA Builder](public/icons/icon-base.png)

## Features

### Core PWA Features
- **Service Worker** - Cache-first strategy for offline support
- **Web App Manifest** - Installable on any device
- **Offline Indicator** - Visual feedback when offline
- **Pull-to-Refresh** - Mobile gesture to refresh data
- **Dark/Light Mode** - Theme toggle with persistence

### App Builder Features
- **Multiple App Types**
  - **Data Apps** - Display data from spreadsheets/database
  - **Forms** - Collect responses to your database
  - **Websites** - Create information pages
  - **Embeds** - Embed external links

- **Custom Icons** - Upload your own, choose emoji, or use defaults
- **Data Views** - Table view (desktop) and Card view (mobile)
- **Favorites System** - Heart icon to save items, filter favorites
- **Data Freshness** - Shows when data was last refreshed
- **Share Links** - QR code generation for sharing apps

### Developer Features
- **Print Optimization** - Clean layout when printing (Ctrl+P)
- **Fully Responsive** - Mobile-first design
- **TypeScript** - Full type safety
- **Prisma ORM** - SQLite database

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Theme**: next-themes

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pwa-builder

# Install dependencies
bun install

# Set up the database
bun run db:push

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema
├── public/
│   ├── icons/             # App icons
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── [shareCode]/   # Shared app page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Main dashboard
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── app-builder/   # App creation components
│   │   ├── data/          # Data view components
│   │   ├── forms/         # Form builder components
│   │   ├── pwa/           # PWA-specific components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   └── lib/
│       ├── stores/        # Zustand stores
│       ├── db.ts          # Prisma client
│       └── utils.ts       # Utility functions
└── package.json
```

## API Endpoints

### Apps
- `GET /api/apps` - List all apps
- `POST /api/apps` - Create new app
- `GET /api/apps/[id]` - Get single app
- `PUT /api/apps/[id]` - Update app
- `DELETE /api/apps/[id]` - Delete app
- `GET /api/apps/share/[shareCode]` - Get app by share code (public)

### Data Items
- `GET /api/data-items` - List data items
- `POST /api/data-items` - Create data item
- `GET /api/data-items/[id]` - Get single item
- `PUT /api/data-items/[id]` - Update item
- `DELETE /api/data-items/[id]` - Delete item

### Forms
- `GET /api/forms` - List forms
- `POST /api/forms` - Create form
- `GET /api/forms/[id]` - Get single form
- `PUT /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form

### Form Entries
- `GET /api/entries` - List form entries
- `POST /api/entries` - Submit form entry (public)

## PWA Installation

### On Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or click the floating install button

### On Mobile (iOS)
1. Tap the Share button
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" in the top right

### On Mobile (Android)
1. Tap the menu button (three dots)
2. Tap "Add to Home screen" or "Install app"

## Customization

### Adding Custom Icons
1. Click "New App" in the dashboard
2. Choose "Upload" tab in the icon selector
3. Upload your image (PNG, JPG, SVG up to 2MB)

### Connecting Google Sheets
*(Coming soon - currently shows demo data)*

The app is designed to connect to Google Sheets. Configuration:
1. Create a Google Service Account
2. Share your sheet with the service account email
3. Add the sheet URL in the app settings

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

### Static Export
```bash
bun run build
# Output in .next/standalone
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this for personal or commercial projects.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [TanStack Table](https://tanstack.com/table) - Powerful table library
- [dnd-kit](https://dndkit.com/) - Drag and drop for form builder
- [Lucide](https://lucide.dev/) - Beautiful icons

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
