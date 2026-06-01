/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Imagens (até 30 MB) e áudios (até 50 MB) são enviados como data URL (base64),
      // o que adiciona ~33% de overhead. 120 MB cobre o pior caso com folga.
      bodySizeLimit: "120mb",
    },
  },
};

export default nextConfig;
