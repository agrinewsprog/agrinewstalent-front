import Image from 'next/image';

const features = [
  {
    title: 'Red de estudiantes y graduados en el sector',
    description:
      'Tus vacantes llegarán a toda nuestra red de alumnos y conseguirás muchos candidatos cualificados.',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=700&q=80',
    alt: 'Estudiantes graduados',
  },
  {
    title: 'Convenio con las principales Universidades del sector',
    description:
      'Nos encargamos de todo el papeleo con la Universidad (convenio).',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80',
    alt: 'Universidad',
  },
  {
    title: 'Presencia mundial',
    description: 'Tus vacantes llegan con alcance máximo a nivel mundial.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=700&q=80',
    alt: 'Presencia global',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-14">
          ¿Por qué elegir{' '}
          <span className="text-green-600">agriNews Talent</span>?
        </h2>

        {/* Filas alternantes */}
        <div className="space-y-16">
          {features.map((feature, index) => {
            const imageRight = index % 2 !== 0;
            return (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                  imageRight ? '' : ''
                }`}
              >
                {/* Imagen */}
                <div
                  className={`relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg ${
                    imageRight ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Texto */}
                <div className={imageRight ? 'lg:order-1' : 'lg:order-2'}>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
