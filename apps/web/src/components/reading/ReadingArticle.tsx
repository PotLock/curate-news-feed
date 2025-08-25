interface ReadingArticleProps {
  item: {
    title: string;
    date: string;
    published?: string;
    author?: Array<{ name: string; email?: string; link?: string; avatar?: string }>;
    category?: Array<{ name: string; domain?: string; scheme?: string; term?: string }>;
    description?: string;
    content?: string;
    link: string;
    image?: string | { url: string; type?: string; length?: number; title?: string };
    copyright?: string;
  };
}

export function ReadingArticle({ item }: ReadingArticleProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getImageUrl = (image: string | { url: string } | undefined) => {
    if (!image) return null;
    return typeof image === "string" ? image : image.url;
  };

  return (
    <article className="w-full max-w-4xl">
      {/* Hero Image */}
      {getImageUrl(item.image) && (
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
          <img
            src={getImageUrl(item.image)!}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-black mb-6 font-inter">
        {item.title}
      </h1>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
        {item.author && item.author[0] && (
          <span className="font-inter">By {item.author[0].name}</span>
        )}
        <time dateTime={item.date} className="font-inter">
          {formatDate(item.date)}
        </time>
        {item.published && (
          <span className="font-inter">
            Published: {formatDate(item.published)}
          </span>
        )}
      </div>

      {/* Categories */}
      {item.category && item.category.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {item.category.map((cat: any, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="mb-8">
          <p className="text-lg text-gray-700 leading-relaxed font-inter">
            {item.description}
          </p>
        </div>
      )}

      {/* Content */}
      {item.content && (
        <div className="mb-8">
          <div
            className="prose prose-lg max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
      )}

      {/* Action to read original */}
      <div className="mb-8">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors font-inter"
        >
          Read Original Article
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      {/* Copyright */}
      {item.copyright && (
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-inter">
            {item.copyright}
          </p>
        </div>
      )}
    </article>
  );
}