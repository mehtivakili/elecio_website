import { NextResponse } from 'next/server';
import { getStaffPrincipal } from '@/server/auth/staff-flow';
export const dynamic = 'force-dynamic';
export async function GET() { const staff = await getStaffPrincipal(); return NextResponse.json(staff ? { authenticated: true, role: staff.role } : { authenticated: false }, { headers: { 'Cache-Control': 'no-store' } }); }
