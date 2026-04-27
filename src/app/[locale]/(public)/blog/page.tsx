import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.blog' });
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-gray-500 sm:text-base">{t('subtitle')}</p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-800">{t('title')}</p>
          <p className="mt-1 text-sm text-gray-500">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-green-700">{post.category || t('title')}</p>
              <h2 className="mt-2 text-xl font-semibold text-gray-950">{post.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between gap-4 text-xs text-gray-400">
                <span>{post.author}</span>
                <span>{post.date}</span>
              </div>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="mt-5 inline-flex items-center text-sm font-semibold text-green-700 transition-colors hover:text-green-800"
              >
                {t('readMore')}
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
