/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@langchain/openai',
    '@langchain/pinecone',
    '@langchain/core',
    'openai',
    '@pinecone-database/pinecone',
    'pdf-parse',
    'mammoth',
    // Spec 9: spawns its bundled native Claude Code binary — must stay a plain Node package, not bundled.
    '@anthropic-ai/claude-agent-sdk',
  ],
}

export default nextConfig
