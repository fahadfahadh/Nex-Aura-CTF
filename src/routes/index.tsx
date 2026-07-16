import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nex Aura — The Future of Competitive Cybersecurity" },
      {
        name: "description",
        content:
          "Nex Aura is a global cybersecurity, CTF, AI and technology community evolving into a revolutionary competitive platform for hackers, researchers and builders.",
      },
      { property: "og:title", content: "Nex Aura — The Future of Competitive Cybersecurity" },
      {
        property: "og:description",
        content:
          "A global community of hackers, developers and security researchers. Building the next generation competitive cybersecurity platform.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Nex Aura — The Future of Competitive Cybersecurity",
      },
      {
        name: "twitter:description",
        content: "Hackers, researchers and builders shaping the next era of cyber competitions.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/home.html");
  }, []);
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#050816",
        color: "#E7ECFF",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p>Loading Nex Aura…</p>
    </div>
  );
}
