# Amplify Marketing Suite
![Amplify Marketing Suite](https://www.amplifyaol.com/images/amplify-logo-v4.png)

## Overview

Amplify Marketing Suite is an AI-powered marketing platform designed specifically for the Art of Living community. It helps teachers, state coordinators, and national teams create data-driven marketing campaigns with ease. The platform combines market insights, curated wisdom, and AI-generated content to streamline the marketing process.

## Features

### 🔍 Detailed Market Insights
- Access curated market insights that reveal exactly what motivates your specific audience
- Presented in a beautiful, actionable format

### 📚 Automatically Curate Gurudev's Wisdom
- Automatically identify, curate, and fetch the most relevant quotes for your audience from Gurudev's wisdom
- Organize wisdom by topic for easy access

### 📱 Multi-Channel Made Simple
- AI automatically creates high-performing copy for email, social media, WhatsApp, and print materials
- Content optimized for each platform

### 🎨 Consistently On-Brand
- Ensure Art of Living's authentic voice comes across all channels with wisdom copy and high-end imagery
- Maintain consistent messaging across all platforms

### 🖼️ AI-Generated Visuals
- Create stunning, channel-optimized visuals using AI to complement your messaging
- Easily edit and refine generated images

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Hooks
- **API Integration**: Airtable API, Custom Webhooks
- **Authentication**: Session-based authentication
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Airtable account with API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/amplify-marketing-suite.git
   cd amplify-marketing-suite

   I'll create a comprehensive README.md file for the Amplify Marketing Suite project:

```markdown project="Amplify Marketing Suite" file="README.md"
...
```

2. Install dependencies:

```shellscript
npm install
# or
yarn install
```


3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```plaintext
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
```


4. Run the development server:

```shellscript
npm run dev
# or
yarn dev
```


5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Project Structure

```
amplify-marketing-suite/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Authentication pages
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ad-brief/           # Ad brief components
│   ├── ad-copy/            # Ad copy components
│   ├── campaign-selection/ # Campaign selection components
│   ├── review-image/       # Image review components
│   └── ui/                 # UI components
├── lib/                    # Utility functions
│   └── airtable.ts         # Airtable API service
├── public/                 # Static assets
│   └── images/             # Image assets
└── types/                  # TypeScript type definitions
```

## Usage Guide

### Creating a New Campaign

1. **Select Campaign Type**: Choose from workshop promotion, event marketing, or other campaign types
2. **Enter Campaign Details**: Provide essential information about your event, including date, location, and target audience
3. **Review Ad Brief**: Fill out the ad brief form with product, orientation, color, and ad type
4. **Edit Ad Copy**: Review and edit the AI-generated headline, sub-headline, button text, and body copy
5. **Review AI Image**: Review, edit prompt, and refine the AI-generated image
6. **Finalize Creative**: Publish your complete campaign across all channels


### Viewing Past Campaigns

1. Navigate to the Past Campaigns section
2. Browse through previous campaigns
3. View detailed analytics and performance metrics
4. Reuse successful campaigns as templates for new ones


## Contributing

We welcome contributions to the Amplify Marketing Suite! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Art of Living Foundation for inspiration and guidance
- All contributors who have helped shape this platform
- The open-source community for the amazing tools and libraries
```


This README provides a comprehensive overview of the Amplify Marketing Suite project, including its features, installation instructions, and usage guide. It's designed to help users understand what the project is about and how to use it effectively.
```
