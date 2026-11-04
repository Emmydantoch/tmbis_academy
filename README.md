# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Vercel deployment

Configure the Vercel project to use `frontend` as its root directory, `npm run
build` as its build command, and `dist` as its output directory. Set
`VITE_API_BASE_URL` to
`https://tmbisacademyback-production.up.railway.app/api/` if the backend URL
changes.

Add `tmbis.org` and `www.tmbis.org` to the Vercel project's Domains page. In
Namecheap, set the DNS records to the values Vercel displays for those domains
(typically an apex `A` record and a `www` `CNAME`). Avoid conflicting URL
redirect records and wait for DNS propagation and Vercel certificate issuance.

On Railway, set `CORS_ALLOWED_ORIGINS` to the comma-separated production
origins `https://tmbis.org,https://www.tmbis.org,https://tmbis-academy-imw17n9om.vercel.app`
and set `FRONTEND_URL=https://tmbis.org`. The values must be origins only:
scheme and hostname, without paths or trailing slashes.

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
