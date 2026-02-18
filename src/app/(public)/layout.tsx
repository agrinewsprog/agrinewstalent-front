import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                AgriNews Talent
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Nosotros
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Contacto
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AgriNews Talent</h3>
              <p className="text-gray-400">
                Conectamos talento con empresas del sector agrícola
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2026 AgriNews Talent. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
