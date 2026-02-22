import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/_next/", "/admin/"],
            },
            {
                // Let Google crawl everything
                userAgent: "Googlebot",
                allow: "/",
            },
        ],
        sitemap: "https://kortana.xyz/sitemap.xml",
        host: "https://kortana.xyz",
    };
}
