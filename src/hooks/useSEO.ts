import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
}

const ensureMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const ensureLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const useSEO = ({ title, description, canonical }: SEOOptions) => {
  useEffect(() => {
    document.title = title.length > 60 ? title.slice(0, 57) + "..." : title;
    if (description) {
      const desc = description.length > 160 ? description.slice(0, 157) + "..." : description;
      ensureMeta("description", desc);
      ensureMeta("og:title", title, "property");
      ensureMeta("og:description", desc, "property");
    }
    const url = canonical ?? window.location.origin + window.location.pathname;
    ensureLink("canonical", url);
  }, [title, description, canonical]);
};
