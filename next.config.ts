import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // Ensure WebAssembly files are handled properly
    config.module?.rules?.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Enable WebAssembly as an initial value
    config.output = {
      ...config.output,
      webassemblyModuleFilename: "static/wasm/[modulehash].wasm",
    };

    return config;
  },
};

export default nextConfig;
