import { NextResponse } from 'next/server';
import { createGraphqlClient } from '@/app/lib/graphql/client';
import { ADMIN_LOGIN } from '@/app/lib/graphql/mutations';
import { getGqlErrorMessage } from '@/app/lib/utils/gql-error';

type AdminLoginResult = {
  adminLogin: {
    token: string;
    adminUser: { id: string; email: string; fullName: string; isActive: boolean };
  };
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const client = createGraphqlClient();
    const data = await client.request<AdminLoginResult>(ADMIN_LOGIN, { input: { email, password } });
    const { token, adminUser } = data.adminLogin;

    const response = NextResponse.json({ adminUser });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });
    return response;
  } catch (err) {
    return NextResponse.json(
      { message: getGqlErrorMessage(err, 'Invalid email or password') },
      { status: 401 }
    );
  }
}
