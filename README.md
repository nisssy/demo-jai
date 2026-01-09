# my-v0-project

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

## Environment Variables

This application uses `PAGE_RENDERING_SERVICE_URL` as the base URL for the application.

### Local Development

Create a `.env.local` file in the root directory with the following content:

```env
PAGE_RENDERING_SERVICE_URL=http://localhost:3000
```

### Production

Set the `PAGE_RENDERING_SERVICE_URL` environment variable to your production base URL.

The application will automatically use this value as the base URL. You can access it using:

```typescript
import { getBaseURL, BASE_URL } from '@/lib/config'

// Function call (recommended for dynamic access)
const baseUrl = getBaseURL()

// Constant (evaluated at module load time)
const baseUrl = BASE_URL
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
