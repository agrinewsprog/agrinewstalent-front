import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const [common, auth, publicMsg, intranet] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/public.json`),
    import(`../../messages/${locale}/intranet.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      auth: auth.default,
      public: publicMsg.default,
      intranet: intranet.default,
    },
  };
});
