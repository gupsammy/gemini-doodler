# Gemini Doodler

A creative drawing application powered by Google's Gemini AI that lets you create and enhance artwork through generative AI.

![Gemini Doodler](https://i.imgur.com/your-app-screenshot.png)

## Overview

Gemini Doodler is an interactive web application that combines traditional drawing tools with AI-powered image generation. Draw on a canvas and use natural language prompts to transform your doodles into detailed artwork with Gemini AI.

### Features

- **Drawing Tools:** Brush, line, rectangle, ellipse, and fill tools
- **Canvas Navigation:** Pan and zoom functionality
- **History Management:** Undo, redo, and view drawing history
- **AI Image Generation:** Transform your drawings using text prompts
- **Responsive Design:** Works on both desktop and mobile devices

## How to Use

1. **Start Drawing:** Use the toolbar to select drawing tools and colors
2. **Navigate:** Use the middle mouse button or two-finger touch to pan the canvas
3. **Generate and Edit Images:** Type a prompt in the bottom text field and press Enter to transform your drawing
4. **View History:** Access your drawing history from the sidebar
5. **Undo/Redo:** Use the controls to undo or redo your actions

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gemini-doodler.git
   cd gemini-doodler
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Gemini API key:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Environment Variables

| Variable         | Description                           |
| ---------------- | ------------------------------------- |
| `GEMINI_API_KEY` | Your Google Gemini API key (required) |

## Technology Stack

- **Framework:** Next.js 15
- **UI:** React 19, Tailwind CSS
- **AI Integration:** Google Generative AI (@google/generative-ai)
- **State Management:** React Context API
- **Styling:** shadcn/ui components, Tailwind CSS

## Project Structure

```
gemini-doodler/
├── app/               # Next.js app router files
│   ├── api/           # API routes including Gemini integration
│   └── page.tsx       # Main application page
├── components/        # React components
│   └── doodler/       # Drawing application components
├── lib/               # Utility functions and context
│   ├── doodler-context.tsx  # App state management
│   └── doodler-types.ts     # TypeScript type definitions
└── public/            # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
