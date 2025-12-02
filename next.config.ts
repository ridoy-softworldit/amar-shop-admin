/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "res.cloudinary.com",
      "images.unsplash.com",
      "i.imgur.com",
      "via.placeholder.com",
      "picsum.photos",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all domains in development
      },
      {
        protocol: "http",
        hostname: "**", // Allow all HTTP domains in development
      },
    ],
    dangerouslyAllowSVG: true,
  },
  // Enable detailed logging in development
  ...(process.env.NODE_ENV === "development" && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

export default nextConfig;
