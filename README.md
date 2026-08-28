This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Admin panel & RBAC

The `/admin` module is gated by a four-tier role model. Every member has a
`users/{uid}` Firestore doc with a `role` field:

| Role          | Rank | Can create      | Notes                                        |
| ------------- | ---- | --------------- | -------------------------------------------- |
| `super_admin` | 4    | anyone (manual) | Hidden from every management UI and listing. |
| `admin`       | 3    | manager, agent  | Full platform control + feature flags*.      |
| `manager`     | 2    | agent           | Supervises the leads pipeline / team.        |
| `agent`       | 1    | —               | Operative user; invitation-only.             |

\* Feature flags (`settings/features`) are writable only by `super_admin`.

Enforcement lives in `firestore.rules` (the real gate, on every read/write)
and `app/admin/(dashboard)/layout.tsx` (client-side route guard). `proxy.ts`
only strips caching/indexing from `/admin` — it cannot verify the Firebase
session server-side (that needs the Admin SDK + a `__session` cookie).

### Bootstrapping the first super_admin

No client path can grant `super_admin`. Create the first one by hand:

1. Firebase Console → Firestore → `users` collection.
2. Open the doc whose ID is your Firebase Auth UID (sign in once at
   `/admin/login` to create it, or check Authentication → Users).
3. Set `role` to `super_admin`.

From then on that account sees the Feature flags card in
`/admin/settings` and can manage every other member.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
