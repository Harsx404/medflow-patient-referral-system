/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Node.js APIs for server-side processing
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow Node.js modules in server-side code
      config.externals = config.externals || []
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse'
      })
    }
    return config
  },
  // Configure API routes to use Node.js runtime
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  }
}

module.exports = nextConfig