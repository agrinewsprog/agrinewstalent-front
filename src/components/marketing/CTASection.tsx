import Link from 'next/link';

const steps = [
  {
    href: '/registro?tipo=empresa',
    label: 'Publicar vacantes',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/login',
    label: 'Ver mis vacantes',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/candidatos',
    label: 'Ver candidatos',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function CTASection() {
  return (
    <section className="py-14 bg-gray-50 border-y border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-2">
          Da el{' '}
          <span className="text-green-600">primer paso</span> en tu proceso de selección
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
          {steps.map((step) => (
            <Link
              key={step.label}
              href={step.href}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md group-hover:bg-green-700 transition-colors">
                {step.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                {step.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


