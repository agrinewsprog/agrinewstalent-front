import { getPostBySlug, getAllPosts } from '@/src/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarIcon, UserIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }

  return {
    title: `${post.title} - Blog AgriNews Talent`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Función simple para convertir Markdown a HTML básico
  const renderMarkdown = (content: string) => {
    // Esta es una implementación muy básica
    // En producción, usarías una librería como react-markdown o similar
    return content
      .split('\n')
      .map((line, index) => {
        // Títulos
        if (line.startsWith('# ')) {
          return `<h1 class="text-4xl font-bold text-gray-900 mb-6 mt-8">${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-3xl font-bold text-gray-900 mb-4 mt-8">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-2xl font-bold text-gray-900 mb-3 mt-6">${line.substring(4)}</h3>`;
        }
        
        // Listas
        if (line.startsWith('- ')) {
          return `<li class="ml-6 mb-2">${line.substring(2)}</li>`;
        }
        
        // Blockquotes
        if (line.startsWith('> ')) {
          return `<blockquote class="border-l-4 border-green-600 pl-4 py-2 my-4 italic text-gray-700 bg-green-50">${line.substring(2)}</blockquote>`;
        }
        
        // Negrita simple
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
        
        // Links
        processedLine = processedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-green-600 hover:text-green-700 underline">$1</a>');
        
        // Párrafos
        if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('>')) {
          return `<p class="mb-4 text-gray-700 leading-relaxed">${processedLine}</p>`;
        }
        
        return processedLine;
      })
      .join('\n');
  };

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          {/* Categoría */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <TagIcon className="h-4 w-4" />
              {post.category}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

          {/* Meta información */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {post.author}
            </span>
          </div>
        </header>

        {/* Imagen destacada */}
        {post.image && (
          <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center h-96">
            <span className="text-white text-8xl">📝</span>
          </div>
        )}

        {/* Contenido del post */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Navegación entre posts */}
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentIndex < allPosts.length - 1 && (
              <Link
                href={`/blog/${allPosts[currentIndex + 1].slug}`}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-green-600 transition-colors"
              >
                <p className="text-sm text-gray-500 mb-2">← Anterior</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {allPosts[currentIndex + 1].title}
                </h3>
              </Link>
            )}
            {currentIndex > 0 && (
              <Link
                href={`/blog/${allPosts[currentIndex - 1].slug}`}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-green-600 transition-colors md:text-right"
              >
                <p className="text-sm text-gray-500 mb-2">Siguiente →</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {allPosts[currentIndex - 1].title}
                </h3>
              </Link>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">¿Buscas oportunidades en el sector agrícola?</h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Descubre ofertas de empleo y prácticas en las mejores empresas del sector agroalimentario
          </p>
          <Link
            href="/empleo-y-practicas"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Ver ofertas disponibles
          </Link>
        </div>

        {/* Posts relacionados */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-5xl">📝</span>
                  </div>
                  <div className="p-4">
                    <span className="inline-block text-xs text-green-600 font-medium mb-2">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
