import { getAllPosts, getAllCategories } from '@/src/lib/blog';
import Link from 'next/link';
import { CalendarIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Blog - AgriNews Talent',
  description: 'Consejos, tendencias y guías para profesionales del sector agroalimentario',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog AgriNews Talent</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Consejos profesionales, tendencias del sector y guías para impulsar tu carrera en el mundo agroalimentario
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categorías */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías</h2>
              <div className="space-y-2">
                <Link
                  href="/blog"
                  className="block px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                >
                  Todas ({posts.length})
                </Link>
                {categories.map((category) => {
                  const count = posts.filter((post) => post.category === category).length;
                  return (
                    <button
                      key={category}
                      className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {category} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Sobre el blog */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Sobre el blog</h3>
                <p className="text-sm text-gray-600">
                  Publicamos regularmente artículos sobre desarrollo profesional, tendencias del sector agroalimentario y consejos para estudiantes.
                </p>
              </div>
            </div>
          </aside>

          {/* Posts Grid */}
          <main className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-600">No hay artículos publicados todavía.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="md:flex">
                      {/* Imagen */}
                      {post.image && (
                        <div className="md:w-1/3">
                          <div className="h-64 md:h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <span className="text-white text-6xl">📝</span>
                          </div>
                        </div>
                      )}

                      {/* Contenido */}
                      <div className={`p-6 ${post.image ? 'md:w-2/3' : 'w-full'}`}>
                        {/* Categoría */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            <TagIcon className="h-4 w-4" />
                            {post.category}
                          </span>
                        </div>

                        {/* Título */}
                        <Link href={`/blog/${post.slug}`}>
                          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors">
                            {post.title}
                          </h2>
                        </Link>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                        {/* Meta información */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {post.author}
                          </span>
                        </div>

                        {/* Botón leer más */}
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                        >
                          Leer artículo completo
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
