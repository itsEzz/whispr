# Whispr

A secure web application for sharing encrypted messages with configurable expiration and view limits. Create temporary, password-protected messages that self-destruct after being viewed or expiring.

## ✨ Features

- **End-to-End Encryption**: Messages are encrypted client-side before transmission
- **Password Protection**: Optional strong password requirements with strength validation
- **Time-Based Expiration**: Set custom expiration times (minutes to months)
- **View Limits**: Control how many times a message can be accessed
- **Self-Destructing Messages**: Messages automatically delete after expiration or max views
- **QR Code Sharing**: Generate QR codes for easy sharing
- **Text File Attachments**: Upload and encrypt text files (code, markdown, etc.)
- **Rate Limiting**: Built-in protection against abuse
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Docker Support**: Easy deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0
- **MySQL** >= 8.0 (or Docker for containerized setup)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/itsEzz/whispr.git
   cd whispr
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**

   ```bash
   # Push schema to database
   pnpm run db:push

   # (Optional) Open Drizzle Studio
   pnpm run db:studio
   ```

5. **Start development server**
   ```bash
   pnpm run dev
   ```

### Docker Compose (Recommended)

1. **Create environment file**

   Copy the Docker environment template and configure your variables:

   ```bash
   cp .env.docker.example .env
   # Edit .env with your database credentials and other settings
   ```

2. **Start the application**

   ```bash
   # Load environment variables and start the application
   source .env && docker-compose -f docker-compose.yml up -d
   ```

   *Note: Docker Compose does not automatically load `.env` files. You must source the file first to set the environment variables.*

3. **Database initialization**

   The database will be automatically initialized with the schema from `drizzle/0000_normal_exodus.sql` on first run.

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run check        # Type checking
pnpm run check:watch  # Type checking with watch mode
pnpm run lint         # Lint code and check format
pnpm run format       # Format code

# Database
pnpm run db:generate  # Generate migrations
pnpm run db:push      # Push schema changes
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio
pnpm run db:drop      # Drop database

# Build
pnpm run build        # Build for production
pnpm run preview      # Preview production build
```

### Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable UI components
│   ├── constants/     # Constant values
│   ├── crypto/        # Crypto utilities
│   ├── hooks/         # Custom hooks
│   ├── schemas/       # Validation schemas
│   ├── server/        # Server-side logic
│   ├── types/         # TypeScript definitions
│   ├── utils/         # Misc utilities
│   ├── workers/       # Web workers
│   └── types/         # TypeScript definitions
├── routes/            # SvelteKit routes
└── app.html           # Main HTML template
```

### App Environment Variables

| Variable                                     | Description                              | Default     | Required |
| -------------------------------------------- | ---------------------------------------- | ----------- | -------- |
| `DATABASE_URL`                               | MySQL connection string                  | -           | Yes      |
| `RATE_LIMITER_IP`                            | Rate limit for IP addresses (JSON array) | `[30, "m"]` | No       |
| `RATE_LIMITER_IPUA`                          | Rate limit for IP+UserAgent (JSON array) | `[20, "m"]` | No       |
| `PUBLIC_CONTENT_MIN_LENGTH`                  | Minimum content length                   | `1`         | No       |
| `PUBLIC_CONTENT_MAX_LENGTH`                  | Maximum content length                   | `1000000`   | No       |
| `PUBLIC_PASSWORD_MIN_LENGTH`                 | Minimum password length                  | `1`         | No       |
| `PUBLIC_PASSWORD_MAX_LENGTH`                 | Maximum password length                  | `255`       | No       |
| `PUBLIC_PASSWORD_UPPER_CASE_REQUIRED`        | Require uppercase in passwords           | `false`     | No       |
| `PUBLIC_PASSWORD_LOWER_CASE_REQUIRED`        | Require lowercase in passwords           | `false`     | No       |
| `PUBLIC_PASSWORD_NUMBER_REQUIRED`            | Require numbers in passwords             | `false`     | No       |
| `PUBLIC_PASSWORD_SPECIAL_CHARACTER_REQUIRED` | Require special chars in passwords       | `false`     | No       |
| `PUBLIC_VIEWS_MIN`                           | Minimum view count                       | `1`         | No       |
| `PUBLIC_VIEWS_MAX`                           | Maximum view count                       | `1000`      | No       |
| `PUBLIC_VIEWS_DEFAULT`                       | Default view count                       | `10`        | No       |
| `PUBLIC_VIEWS_SHOW_RECIPIENTS_DEFAULT`       | Show view count to recipients by default | `true`      | No       |
| `PUBLIC_VIEWS_UNLIMITED_DEFAULT`             | Allow unlimited views by default         | `false`     | No       |
| `PUBLIC_EXPIRES_IN_MAX_VALUE`                | Maximum expiration value                 | `2`         | No       |
| `PUBLIC_EXPIRES_IN_MAX_UNIT`                 | Maximum expiration unit                  | `months`    | No       |
| `PUBLIC_EXPIRES_IN_VALUE_DEFAULT`            | Default expiration value                 | `1`         | No       |
| `PUBLIC_EXPIRES_IN_UNIT_DEFAULT`             | Default expiration unit                  | `hours`     | No       |
| `PUBLIC_EXPIRES_IN_SHOW_RECIPIENTS_DEFAULT`  | Show expiration to recipients by default | `true`      | No       |
| `PUBLIC_SHOW_COPY_BUTTON_DEFAULT`            | Show copy button by default              | `true`      | No       |
| `PUBLIC_SHOW_DOWNLOAD_BUTTON_DEFAULT`        | Show download button by default          | `true`      | No       |

## 🚢 Deployment

### Docker Compose (Recommended)

See the **Docker Compose** section above in Quick Start for complete setup instructions.

### Manual Deployment

1. Build the application: `pnpm run build`
2. Deploy the `build/` directory to your hosting provider
3. Ensure environment variables are set
4. Configure your web server (nginx, Apache, etc.)

### Health Check

The application includes a health check endpoint at `/health` for monitoring.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and run tests: `pnpm run check && pnpm run lint`
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation for new features
- Ensure type safety with TypeScript
- Test your changes thoroughly

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Full-stack framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [MySQL](https://www.mysql.com/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [Shadcn Svelte](https://www.shadcn-svelte.com/) - Accessible component library
- **Forms**: [Superforms](https://superforms.rocks/) - Form validation
- **Deployment**: Docker & Docker Compose

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
