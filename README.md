# Video Insights Generator

A full-stack web application for analyzing videos using Google's Gemini multimodal AI. Provide YouTube URLs to extract actionable insights, transcripts, summaries, and interact with an AI-powered chatbot about video content.

## About This Project

This is a portfolio project built to explore and experiment with:
- Google's Gemini 2.5 Flash multimodal API for direct video processing
- Full-stack development with Next.js, TypeScript, and React
- User authentication and session management with Supabase
- RAG (Retrieval Augmented Generation) for efficient Q&A systems
- Rate limiting and API security best practices
- Database design and data persistence

## Features

### Core Functionality
- **Direct Video Processing**: Uses Gemini's multimodal capabilities to process video directly without separate transcription steps
- **YouTube URL Support**: Process YouTube videos directly via URL without downloading
- **Structured Output**: Extracts actionable tasks, insights, summaries, and full transcripts
- **RAG-based Chat**: Efficient Q&A system using stored transcripts for faster, cost-effective responses
- **User Authentication**: Secure sign up/sign in with Supabase Auth
- **History Management**: Save and revisit analyzed videos and Q&A sessions
- **Rate Limiting**: Per-user rate limits to prevent abuse
- **Modern UI**: Responsive design built with Tailwind CSS

### Technical Features
- Row-level security for data isolation
- Protected API routes with authentication middleware
- Input validation and error handling
- Session management with automatic refresh
- Type-safe development with TypeScript

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Supabase account (for authentication and database)

## Installation

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd video-insights-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the `video-insights-generator` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - See `SUPABASE_SETUP.md` for detailed setup instructions including RLS policies

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### First Time Setup

1. **Sign Up**: Create an account using the sign up form
2. **Email Confirmation**: Confirm your email address (if required by Supabase settings)
3. **Sign In**: Log in with your credentials

### Analyzing a Video

1. Navigate to the main application interface (`/app`)
2. Enter a YouTube URL in the input field
3. Optionally configure:
   - Include summary (toggle)
   - Custom Gemini API key (if different from default)
4. Click "Generate insights"
5. Wait for processing to complete
6. View results:
   - Summary of key points
   - Actionable tasks with Task, Owner, and Deadline
   - Key insights and learnings
   - Full transcript

### Asking Questions

1. After analyzing a video, use the chat interface
2. Type your question about the video content
3. The AI responds using the stored transcript (RAG approach)
4. Previous questions and answers are saved in your history

### Viewing History

- Access your video history from the sidebar
- Click on any previous video to view its analysis
- View Q&A history for each video
- Continue conversations from where you left off

## Project Structure

```
video-insights-generator/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── history/           # History management
│   │   ├── transcript/        # Transcript operations
│   │   ├── video/             # Video analysis endpoints
│   │   └── utils/             # Shared utilities
│   ├── auth/                  # Authentication pages
│   ├── components/            # React components
│   ├── page.tsx               # Landing page
│   └── [userID]/              # User-specific routes
├── lib/
│   ├── geminiClient.ts        # Gemini API client
│   ├── rateLimit.ts           # Rate limiting logic
│   └── supabase/              # Supabase client configuration
├── supabase/
│   ├── schema.sql             # Database schema
│   └── SCHEMA_DIAGRAM.md      # Schema documentation
├── middleware.ts              # Next.js middleware for auth
└── package.json               # Dependencies
```

## How It Works

### Video Analysis Flow

1. **Input Validation**: User provides a YouTube URL
2. **Authentication Check**: Verify user is authenticated
3. **Rate Limiting**: Check if user has exceeded rate limits
4. **API Processing**: Send video to Gemini API for analysis
5. **Data Extraction**: Extract transcript, summary, insights, and action items
6. **Database Storage**: Save results linked to user account
7. **Response**: Return structured data to client

### RAG-based Q&A System

The Q&A system uses a Retrieval Augmented Generation approach:

1. **Initial Analysis**: Video is transcribed once during analysis
2. **Storage**: Transcript is stored in the database
3. **Question Processing**: When a user asks a question:
   - Retrieve the stored transcript for the video
   - Send transcript + question to Gemini API
   - Generate answer based on transcript context
4. **Benefits**:
   - Faster response times (no video reprocessing)
   - Lower API costs (text processing vs video processing)
   - More efficient resource usage

### Rate Limiting

The application implements per-user rate limiting:

- `/api/video/analyze`: 10 requests per hour
- `/api/video/question`: 50 requests per hour
- `/api/video/transcript`: 20 requests per hour
- `/api/transcript/summarize`: 30 requests per hour
- `/api/history/*`: 60 requests per minute

Rate limits are tracked per authenticated user. See `RATE_LIMITING.md` for implementation details.

## API Endpoints

### Video Analysis
- `POST /api/video/analyze` - Analyze a video and extract insights
- `POST /api/video/question` - Ask questions about a video
- `POST /api/video/transcript` - Get transcript for a video

### History
- `GET /api/history/videos` - Get user's video history
- `POST /api/history/videos` - Create video record
- `GET /api/history/questions` - Get user's question history
- `POST /api/history/questions` - Create question record

### Authentication
- `GET /api/auth/user` - Get current authenticated user

All endpoints require authentication except the landing page.

## Configuration

### Gemini Models

The application supports multiple Gemini models:

- `gemini-2.5-flash-lite` (Recommended): Best for video processing, supports multimodal input
- `gemini-pro`: General purpose model
- `gemini-1.5-pro`: Advanced model with longer context window

### Supported Video Sources

- **YouTube URLs**: Direct processing via URL (no download required)
- **Other video URLs**: Currently not supported (planned for future release)

### Video Processing

- YouTube videos are processed directly via URL
- No file size limits for YouTube videos
- Processing time depends on video length

## Security Features

- **Authentication**: All API routes require authentication
- **Row-Level Security**: Supabase RLS policies ensure users can only access their own data
- **Session Management**: Secure session handling with automatic refresh
- **Input Validation**: URL format validation and required field checks
- **Rate Limiting**: Prevents abuse and protects against DoS attacks
- **Environment Variables**: Sensitive data stored securely, not exposed to client

## Troubleshooting

### Authentication Issues

- Verify Supabase credentials in `.env.local`
- Check that email confirmation is set up correctly in Supabase
- See `EMAIL_TROUBLESHOOTING.md` for email-related issues
- See `GOOGLE_OAUTH_SETUP.md` if using OAuth

### API Key Errors

- Verify your Gemini API key is correct
- Check that you have API access enabled in Google AI Studio
- Ensure the API key has access to Gemini 2.5 Flash model
- See `API_KEY_SECURITY.md` for security best practices

### Video Processing Errors

- Large videos may take significant time - be patient
- Ensure stable internet connection
- YouTube URLs must be publicly accessible
- Check browser console for detailed error messages

### Database Issues

- Verify Supabase connection and credentials
- Ensure database schema is set up correctly (`supabase/schema.sql`)
- Check RLS policies are enabled
- See `SUPABASE_SETUP.md` for detailed instructions

### Rate Limit Errors

- Check rate limit headers in response
- Wait for the reset time indicated in error message
- Rate limits reset on a sliding window basis

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Limitations

- **Video Duration Limits**: Very long YouTube videos (>1-2 hours) may timeout before processing completes due to Next.js/Vercel API route timeout limits (default 10-60 seconds depending on plan)
- Processing time depends on video length (longer videos take more time)
- YouTube videos must be publicly accessible
- API rate limits apply based on your Google AI Studio plan
- Currently only YouTube URLs are supported (file uploads planned for future release)
- Rate limiting uses in-memory storage (single instance) - Redis recommended for production scaling
- **No duration validation**: The application doesn't check video length before processing, which may result in timeouts for very long videos

## Documentation

Additional documentation is available in the project:

- `SYSTEM_FLOW.md` - Complete system flow and architecture documentation
- `SUPABASE_SETUP.md` - Detailed Supabase setup instructions
- `API_KEY_SECURITY.md` - API key security best practices
- `RATE_LIMITING.md` - Rate limiting implementation details
- `EMAIL_TROUBLESHOOTING.md` - Email authentication troubleshooting
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup guide

## Use Cases

This application is useful for:

- **Meeting Recordings**: Extract action items and key decisions from team meetings
- **Educational Videos**: Get summaries and key takeaways from lectures
- **YouTube Content**: Analyze any YouTube video for insights and tasks
- **Training Videos**: Identify actionable steps and insights
- **Research**: Quickly understand video content without watching entirely

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI API**: Google Gemini 2.5 Flash


## Future Improvements

Potential enhancements for future development:

- File upload support for local video files (MP4, AVI, MOV, MKV, WEBM, FLV)
- Batch processing for multiple videos
- Export results to various formats (PDF, Markdown, etc.)
- Video summarization with timestamps
- Integration with calendar apps for action items
- Support for more video platforms
- Redis-based rate limiting for production
- Caching for frequently accessed videos
- Video preview thumbnails in history
- Real-time processing status updates

## License

This project is open source and available for personal and educational use.

## Acknowledgments

- [Google Gemini API](https://ai.google.dev/) for multimodal AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for authentication and database
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Notes

This is a personal portfolio project built for learning purposes. It is not a commercial product, and no guarantees are made about its reliability or suitability for production use. Use at your own discretion.

For questions or issues, please refer to the troubleshooting section or review the detailed documentation files included in the project.
