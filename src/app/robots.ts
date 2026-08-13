import type { MetadataRoute } from 'next';import { SITE_URL } from '@/lib/seo';
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:'*',allow:'/',disallow:['/api/','/fa/admin','/en/admin','/fa/account','/en/account','/fa/login','/en/login','/fa/verify','/en/verify']},sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL}}
