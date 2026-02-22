import type { MetadataRoute } from "next";

const BASE_URL = "https://kortana.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Static pages with priority weights
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/technology`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/developers`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/tokenomics`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/whitepaper`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/docs`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/docs/getting-started`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/docs/evm-compatibility`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/consensus`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/smart-contracts`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/staking`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/rpc-api`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/architecture`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/community`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/network-status`,
            lastModified: now,
            changeFrequency: "always",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/faucets`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/solutions`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    return staticRoutes;
}
