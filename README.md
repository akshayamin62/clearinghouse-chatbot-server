# Clearinghouse CDFI Chatbot

An AI-powered chatbot for [Clearinghouse Community Development Financial Institution](https://www.clearinghousecdfi.com/) that helps users find information about loans, investment opportunities, community impact programs, and financial services.

## About Clearinghouse CDFI

Clearinghouse CDFI is a community lender and Benefit "B" Corporation that addresses unmet credit needs throughout the U.S. and in Indian Country through direct lending, equity investments, and financial assistance. They provide:

- **Community Facilities** financing
- **Affordable Housing** loans  
- **Commercial Real Estate** funding
- **New Markets Tax Credits**
- **Small Business** lending
- Impact investing and CRA compliance solutions

## Features

- Answer questions about loan products and services
- Help with investment and CRA requirements
- Provide information about impact programs and success stories
- Guide users through financial education resources
- Assist with contact information and office locations

## Quick Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   FIRECRAWL_API_KEY=your_firecrawl_key
   UPSTASH_SEARCH_REST_URL=your_upstash_search_url
   UPSTASH_SEARCH_REST_TOKEN=your_upstash_search_token
   OPENAI_API_KEY=your_openai_key
   ```
4. Run: `npm run dev`

## Deployment

Ready for deployment on Render, Vercel, or any Node.js hosting platform. See deployment configuration files included in the project.

---

 [www.clearinghousecdfi.com](https://www.clearinghousecdfi.com/)