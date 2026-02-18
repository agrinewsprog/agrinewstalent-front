import Link from 'next/link';

interface CTAButton {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface CTASectionProps {
  title: string;
  subtitle?: string;
  buttons: CTAButton[];
  backgroundColor?: 'gray' | 'green' | 'white';
}

export function CTASection({
  title,
  subtitle,
  buttons,
  backgroundColor = 'gray',
}: CTASectionProps) {
  const bgColors = {
    gray: 'bg-gray-100',
    green: 'bg-green-600 text-white',
    white: 'bg-white',
  };

  const titleColors = {
    gray: 'text-gray-900',
    green: 'text-white',
    white: 'text-gray-900',
  };

  const subtitleColors = {
    gray: 'text-gray-600',
    green: 'text-green-100',
    white: 'text-gray-600',
  };

  const getButtonClasses = (variant: CTAButton['variant'] = 'primary') => {
    if (backgroundColor === 'green') {
      // When background is green
      if (variant === 'primary') {
        return 'bg-white text-green-700 hover:bg-green-50';
      }
      if (variant === 'outline') {
        return 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-green-700';
      }
      return 'bg-green-700 text-white hover:bg-green-800';
    }

    // Default colors for gray/white backgrounds
    if (variant === 'primary') {
      return 'bg-green-600 text-white hover:bg-green-700';
    }
    if (variant === 'outline') {
      return 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50';
    }
    return 'bg-green-700 text-white hover:bg-green-800';
  };

  return (
    <section className={`py-16 sm:py-20 ${bgColors[backgroundColor]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2
            className={`text-3xl sm:text-4xl font-bold mb-4 ${titleColors[backgroundColor]}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-lg sm:text-xl ${subtitleColors[backgroundColor]}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          {buttons.map((button, index) => (
            <Link
              key={index}
              href={button.href}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-semibold text-base ${getButtonClasses(button.variant)}`}
            >
              {button.text}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
