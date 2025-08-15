/** @type {import('next').NextConfig} */
const nextConfig = {
    // Increase the body size limit for API routes to 10MB.
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default nextConfig;
