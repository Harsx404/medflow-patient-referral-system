/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Node.js APIs for server-side processing
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow Node.js modules in server-side code
      config.externals = config.externals || []
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'googleapis': 'commonjs googleapis'
      })
    } else {
      // Exclude Node.js built-in modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false
      }
    }
    return config
  },
  // Configure API routes to use Node.js runtime
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'googleapis']
  }
}

module.exports = nextConfig