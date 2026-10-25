import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Territory Spotless Cleaning Services",
    short_name: "Territory Spotless",
    description: "Carpet, couch, mattress and bond cleaning in Darwin and the Northern Territory.",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF8FA",
    theme_color: "#066676",
    icons: [{ src: "/territory-spotless-app-icon.png", sizes: "512x512", type: "image/png" }],
  };
}
