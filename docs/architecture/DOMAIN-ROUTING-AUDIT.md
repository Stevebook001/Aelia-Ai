# AELIA domain routing audit — 20 November 2026

## Verified Vercel inventory

| Project | Project ID | Domains | Verification |
|---|---|---:|---|
| AELIA frontend (`aeliaai`) | prj_MXwTSfgiFkndYlj8nmU4HyOdxpnt | 50 | 50/50 verified |
| AELIA API (`aelia-api`) | prj_hcoJlOCu0mdEz9uzWXEGf5b7paof | 3 | 3/3 verified |
| AELIA Admin (`aelia-admin`) | prj_kNWoEtRvkLk26SICfhNe903rrEAc | 2 | 2/2 verified |
| SeaChat (`seachat`) | prj_zAfG8ZwtBFLopCeKFBUp2VkomFKM | 2 | 2/2 verified |

Cloudflare zone 5e40779a4c81077434a25716c9711b02 had 59 DNS records before the dev record was added. The dev.aeliaai.org.ng CNAME has now been created DNS-only and points to d753ccdab648f8b8.vercel-dns-017.com, matching the API project's recommended CNAME. The zone therefore has 60 records after that addition.

## Confirmed routing corrections still required

1. api.aeliaai.org.ng is attached to the AELIA frontend project, not the API project. Move the Vercel domain assignment to aelia-api. The API project's recommended CNAME is d753ccdab648f8b8.vercel-dns-017.com.
2. app.aeliaai.org.ng is attached to the frontend with a 308 redirect to aeliaai.vercel.app. Remove the redirect so the app host serves the workspace directly.
3. community.aeliaai.org.ng is attached to the AELIA frontend, but must be attached to the SeaChat project. SeaChat project's recommended CNAME for the community host is 0fbd5027c7fd4942.vercel-dns-017.com. Do not change Cloudflare until the Vercel domain assignment is moved.
4. seachat.aeliaai.org.ng is still attached to the SeaChat project. The product hostname must not be used. Remove that project-domain assignment; do not create its Cloudflare DNS record.
5. blog.aeliaai.org.ng is not attached to Vercel and has no Cloudflare DNS record. The AELIA frontend already has 50/50 domain slots, so first free slots by moving community and api to their correct projects. Then attach blog.aeliaai.org.ng and point its Cloudflare CNAME to 59e248437ccc9f84.vercel-dns-017.com.
6. Make blog.aeliaai.org.ng the canonical blog host. After attaching it, rewrite its root to blogs.html and redirect the old blogs.aeliaai.org.ng host to blog.aeliaai.org.ng. Update canonical and Open Graph URLs in the blog page.

## Friend-owned hostname

phantomveil.aeliaai.org.ng is a separate Cloudflare CNAME to 88fbd08d8d13a5c3.vercel-dns-017.com. It belongs to the user's friend and must remain untouched. It is not an AELIA product domain.

## Tool limitation / manual Vercel step

The connected Vercel actions available in this workflow can list, inspect, add and verify project domains, but do not expose a project-domain removal/reassignment action. The old project-domain assignments must therefore be removed in the Vercel dashboard before the destination project can claim the hostname. No existing domain or DNS record should be deleted speculatively.
