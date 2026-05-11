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
  ],
}

export default nextConfig
