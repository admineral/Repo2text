# AutoDoc - AI Documentation Generator & Code Exporter

Transform your codebase into beautiful documentation with AI power! Plus, easily export your entire local repository to a single text file for AI training or analysis.

## What Makes AutoDoc Special

- **AI-Powered Documentation** - Turn code into comprehensive docs instantly
- **Local Repo Export** - Export your entire codebase to a single, organized text file
- **Multiple Documentation Styles** - From single file docs to full project READMEs
- **Real-Time Cost Tracking** - Monitor token usage and costs as you generate
- **Smart Context Analysis** - AI understands relationships between your files
- **No Git Required** - Works directly with your local files, no repository needed

## Why Use AutoDoc?

- Save hours of documentation time
- Ensure consistent documentation style
- Generate training data for AI models
- Understand complex codebases quickly
- Export code for AI analysis
- Create professional READMEs instantly

## Getting Started

First, set up your environment variables:

```env
OPENAI_API_KEY=your_api_key_here
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Prerequisites

- Node.js (version 18 or higher)
- npm/yarn/pnpm/bun
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI API](https://openai.com/api/) - AI model integration
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Features

### Documentation Generation
- Single file documentation
- Context-aware documentation
- Full project README generation
- Real-time progress tracking
- Token usage monitoring
- Cost estimation

### Code Export
- Export entire directories
- Structured text output
- File hierarchy preservation
- Selective file export
- Large codebase support

## Usage

1. Click "Get Started" or navigate to the documentation generator
2. Select your project folder using the file picker
3. Choose files you want to document or export
4. Select your preferred mode:
   - **Text Export**: Convert your codebase to a single text file
   - **Single Doc**: Document each file individually
   - **With Context**: Generate documentation considering file relationships
   - **README**: Create a comprehensive project README
5. Choose your preferred AI model
6. Generate documentation or export

## Models Available

- **GPT-4o (Latest)**
  - Best for complex documentation needs
  - Higher accuracy and comprehension
  - $2.50/1M input tokens, $10.00/1M output tokens

- **GPT-4o Mini**
  - Cost-effective option
  - Faster processing
  - $0.150/1M input tokens, $0.600/1M output tokens

## Example Output

### Documentation
```markdown
# Component: UserAuthentication

## Overview
This component handles user authentication using JWT tokens...

## Key Features
- Token-based authentication
- Session management
- Secure password handling
```

### Text Export
```text
---- PROJECT FILE STRUCTURE ----
/src
  /components
  /utils
  /pages

---- FILE CONTENTS ----
FILE: /src/components/Auth.tsx
[Content here]

FILE: /src/utils/jwt.ts
[Content here]
```

## Best Practices

- Select relevant files for better context
- Use appropriate models based on complexity
- Review and edit generated documentation
- Keep exported files organized
- Monitor token usage for cost control

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Here's how you can help:

- Report bugs
- Suggest new features
- Improve documentation
- Submit pull requests

## License

[MIT License](LICENSE)

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## Support

Need help? Feel free to [open an issue](issues-link) or contact us at [your-contact-info].