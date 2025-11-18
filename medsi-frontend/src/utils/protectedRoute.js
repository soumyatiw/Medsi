export function requireAuth(ctx, allowedRoles) {
  const userCookie = ctx.req.cookies?.user;

  if (!userCookie) {
    return {
      redirect: { destination: "/login", permanent: false }
    };
  }

  const user = JSON.parse(userCookie);

  if (!allowedRoles.includes(user.role)) {
    return {
      redirect: { destination: "/login", permanent: false }
    };
  }

  return { props: { user } };
}

