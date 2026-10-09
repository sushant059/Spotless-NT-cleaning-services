import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spotless NT Cleaning Services",
    short_name: "Spotless NT",
    description: "Carpet, couch, mattress and bond cleaning in Darwin and the Northern Territory.",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF8FA",
    theme_color: "#066676",
    icons: [{ src: "/spotless-nt-mark.png", sizes: "320x320", type: "image/png" }],
  };
}
