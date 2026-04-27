import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'public.blog' });
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/${locale}/blog`} className="mb-6 inline-flex text-sm font-medium text-green-700 hover:text-green-800">
        {t('backToBlog')}
      </Link>

      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="border-b border-gray-100 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">{post.category || t('title')}</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
          {post.excerpt ? <p className="mt-4 text-base text-gray-600">{post.excerpt}</p> : null}
        </header>

        <div className="prose prose-sm mt-8 max-w-none whitespace-pre-wrap text-gray-700 sm:prose-base">
          {post.content}
        </div>
      </article>
    </main>
  );
}
