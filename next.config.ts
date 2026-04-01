/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["next-mdx-remote"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.charhub.io",
        pathname: "/**",
      },
    ],
  },

  // Enable MDX using MDX-RS (native compiler)
  experimental: {
    mdxRs: true,
  },

  // Allow MDX as a page/module import
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

export default nextConfig;
