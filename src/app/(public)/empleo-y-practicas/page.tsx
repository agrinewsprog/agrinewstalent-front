import { Metadata } from 'next';
import JobsList from '@/src/components/jobs/JobsList';
import type { JobOffer } from '@/src/components/jobs/JobCard';

export const metadata: Metadata = {
  title: 'Empleo y Prácticas | AgriNews Talent',
  description:
    'Encuentra oportunidades laborales y prácticas profesionales en el sector agrícola. Conecta con las mejores empresas del sector.',
  keywords: 'empleo agrícola, prácticas profesionales, ofertas de trabajo, agro, agricultura',
  openGraph: {
    title: 'Empleo y Prácticas | AgriNews Talent',
    description:
      'Encuentra oportunidades laborales y prácticas profesionales en el sector agrícola.',
    type: 'website',
  },
};

async function getOffers(): Promise<JobOffer[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/offers`, {
      cache: 'no-store', // Para obtener datos frescos
      // Puedes usar 'force-cache' o revalidate para ISR
      // next: { revalidate: 60 } // revalidar cada 60 segundos
    });

    if (!res.ok) {
      console.error('Error fetching offers:', res.status, res.statusText);
      return getMockOffers(); // Fallback a datos mock si falla la API
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error connecting to API:', error);
    return getMockOffers(); // Fallback a datos mock si hay error de conexión
  }
}

// Datos mock para desarrollo y fallback
function getMockOffers(): JobOffer[] {
  return [
    {
      id: 1,
      title: 'Ingeniero Agrónomo Senior',
      company: 'AgroTech Solutions',
      location: 'Madrid, España',
      type: 'empleo',
      tags: ['Agronomía', 'Gestión de cultivos', 'Tecnología agrícola', 'Sostenibilidad'],
      salary: '35.000€ - 45.000€',
      workMode: 'Híbrido',
      publishedAt: '2026-02-15T10:00:00Z',
      description: `Buscamos un Ingeniero Agrónomo Senior con experiencia en la implementación de soluciones tecnológicas para la agricultura de precisión. Trabajarás directamente con agricultores y empresas del sector para optimizar sus procesos productivos.

El candidato ideal tendrá pasión por la innovación en el sector agrícola y experiencia en el uso de tecnologías IoT, drones y sistemas de información geográfica.`,
      responsibilities: [
        'Diseñar e implementar estrategias de agricultura de precisión',
        'Asesorar a clientes en el uso eficiente de recursos',
        'Realizar análisis de suelos y cultivos',
        'Liderar proyectos de transformación digital agrícola',
        'Formar equipos técnicos en nuevas tecnologías',
      ],
      requirements: [
        'Grado en Ingeniería Agronómica o similar',
        'Mínimo 5 años de experiencia en el sector',
        'Conocimientos de agricultura de precisión',
        'Experiencia con software GIS y análisis de datos',
        'Carné de conducir B',
      ],
    },
    {
      id: 2,
      title: 'Prácticas en Investigación y Desarrollo',
      company: 'Semillas Innovadoras S.L.',
      location: 'Valencia, España',
      type: 'practicas',
      tags: ['I+D', 'Biotecnología', 'Genética vegetal', 'Laboratorio'],
      salary: '600€ - 800€',
      workMode: 'Presencial',
      publishedAt: '2026-02-10T14:30:00Z',
      description: `Ofrecemos prácticas profesionales en nuestro departamento de I+D para estudiantes apasionados por la biotecnología vegetal y la mejora genética de cultivos.

Aprenderás sobre las últimas técnicas de mejora genética y trabajarás en proyectos reales de desarrollo de nuevas variedades de cultivos adaptadas al cambio climático.`,
      responsibilities: [
        'Asistir en experimentos de laboratorio',
        'Registrar y analizar datos experimentales',
        'Preparar cultivos in vitro',
        'Colaborar en ensayos de campo',
        'Participar en reuniones técnicas del equipo',
      ],
      requirements: [
        'Estudiante de último año de Biotecnología, Biología o Agronomía',
        'Conocimientos básicos de genética vegetal',
        'Manejo de técnicas de laboratorio',
        'Nivel de inglés intermedio (B1-B2)',
        'Disponibilidad para prácticas de 6 meses',
      ],
    },
    {
      id: 3,
      title: 'Responsable de Producción Agrícola',
      company: 'Frutas del Campo',
      location: 'Almería, España',
      type: 'empleo',
      tags: ['Gestión agrícola', 'Producción', 'Invernaderos', 'Liderazgo'],
      salary: '30.000€ - 40.000€',
      workMode: 'Presencial',
      publishedAt: '2026-02-12T09:00:00Z',
      description: `Empresa líder en producción hortofrutícola en invernaderos busca Responsable de Producción para gestionar nuestras instalaciones en Almería.

Serás responsable de coordinar todas las actividades productivas, garantizando la calidad del producto y el cumplimiento de los estándares de sostenibilidad y certificaciones.`,
      responsibilities: [
        'Supervisar y coordinar el equipo de producción (20-30 personas)',
        'Planificar calendarios de siembra y cosecha',
        'Garantizar el cumplimiento de certificaciones (GlobalGAP, etc.)',
        'Optimizar el uso de recursos (agua, fertilizantes, energía)',
        'Reportar métricas de producción a dirección',
      ],
      requirements: [
        'Grado en Ingeniería Agronómica o similar',
        '3-5 años de experiencia en producción bajo invernadero',
        'Experiencia gestionando equipos',
        'Conocimientos de normativas fitosanitarias',
        'Residencia en Almería o disponibilidad para reubicación',
      ],
    },
    {
      id: 4,
      title: 'Especialista en Marketing Digital Agroalimentario',
      company: 'Digital Agro Marketing',
      location: 'Barcelona, España',
      type: 'empleo',
      tags: ['Marketing digital', 'Agroalimentario', 'SEO', 'Redes sociales'],
      salary: '28.000€ - 35.000€',
      workMode: 'Remoto',
      publishedAt: '2026-02-08T11:00:00Z',
      description: `Agencia especializada en marketing para el sector agroalimentario busca Especialista en Marketing Digital para gestionar campañas de clientes del sector agrícola y alimentario.

Buscamos una persona creativa con conocimiento del sector agrícola que pueda desarrollar estrategias de marketing efectivas para empresas del campo.`,
      responsibilities: [
        'Diseñar y ejecutar estrategias de marketing digital',
        'Gestionar redes sociales de clientes del sector',
        'Crear contenido especializado en temática agrícola',
        'Realizar análisis de métricas y KPIs',
        'Coordinar con diseñadores y desarrolladores',
      ],
      requirements: [
        'Grado en Marketing, Publicidad o similar',
        '2-3 años de experiencia en marketing digital',
        'Conocimientos del sector agroalimentario (valorable formación técnica)',
        'Dominio de herramientas de analítica web y redes sociales',
        'Experiencia con Google Ads y Meta Ads',
      ],
    },
    {
      id: 5,
      title: 'Prácticas en Asesoría Técnica',
      company: 'Cooperativa Agraria del Sur',
      location: 'Sevilla, España',
      type: 'practicas',
      tags: ['Asesoría', 'Cultivos', 'Sanidad vegetal', 'Campo'],
      salary: '500€ - 700€',
      workMode: 'Presencial',
      publishedAt: '2026-02-05T08:00:00Z',
      description: `Cooperativa agraria con más de 500 socios ofrece prácticas en nuestro servicio de asesoría técnica. Aprenderás sobre gestión integral de cultivos, sanidad vegetal y asesoramiento a agricultores.

Ideal para estudiantes que quieran adquirir experiencia práctica en el asesoramiento directo a explotaciones agrícolas.`,
      responsibilities: [
        'Acompañar a técnicos en visitas a explotaciones',
        'Realizar toma de muestras y diagnósticos de campo',
        'Apoyar en la elaboración de informes técnicos',
        'Atender consultas telefónicas de agricultores',
        'Participar en jornadas formativas para socios',
      ],
      requirements: [
        'Estudiante de Ingeniería Agronómica (últimos cursos)',
        'Carné de conducir B indispensable',
        'Conocimientos de sanidad vegetal',
        'Capacidad de trabajo en equipo',
        'Disponibilidad inmediata para 6 meses',
      ],
    },
    {
      id: 6,
      title: 'Data Scientist para Agricultura de Precisión',
      company: 'PrecisionFarm Analytics',
      location: 'Madrid, España',
      type: 'empleo',
      tags: ['Data Science', 'Machine Learning', 'Agricultura 4.0', 'Python'],
      salary: '40.000€ - 55.000€',
      workMode: 'Remoto',
      publishedAt: '2026-02-14T15:00:00Z',
      description: `Startup AgTech en crecimiento busca Data Scientist para desarrollar modelos predictivos para agricultura de precisión. Trabajarás con datos de sensores, imágenes satelitales y drones para ayudar a agricultores a tomar mejores decisiones.

Únete a un equipo multidisciplinar que está revolucionando el sector agrícola con tecnología.`,
      responsibilities: [
        'Desarrollar modelos de machine learning para predicción de rendimientos',
        'Procesar y analizar imágenes satelitales y de drones',
        'Crear dashboards de visualización de datos para agricultores',
        'Investigar nuevas aplicaciones de IA en agricultura',
        'Colaborar con agrónomos en la validación de modelos',
      ],
      requirements: [
        'Grado en Data Science, Informática, Matemáticas o similar',
        'Experiencia demostrable con Python (pandas, scikit-learn, TensorFlow)',
        'Conocimientos de procesamiento de imágenes',
        'Interés genuino en el sector agrícola',
        'Nivel alto de inglés (para lectura de papers científicos)',
      ],
    },
  ];
}

export default async function EmpleoYPracticasPage() {
  const offers = await getOffers();

  return <JobsList initialOffers={offers} />;
}
