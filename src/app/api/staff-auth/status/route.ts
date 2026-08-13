import { NextResponse } from 'next/server';
import { getStaffPrincipal } from '@/server/auth/staff-flow';
export const dynamic = 'force-dynamic';
export async function GET() { const staff = await getStaffPrincipal(false); return NextResponse.json(staff ? { authenticated: true, role: staff.role, twoFactorEnabled: staff.twoFactorEnabled } : { authenticated: false }, { headers: { 'Cache-Control': 'no-store' } }); }
