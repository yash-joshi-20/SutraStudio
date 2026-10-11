import { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_BASE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
