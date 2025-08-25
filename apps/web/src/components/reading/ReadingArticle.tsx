interface ReadingArticleProps {
  item: {
    title: string;
    date: string;
    published?: string;
    author?: Array<{
      name: string;
      email?: string;
      link?: string;
      avatar?: string;
    }>;
    category?: Array<{
      name: string;
      domain?: string;
      scheme?: string;
      term?: string;
    }>;
    description?: string;
    content?: string;
    link: string;
    image?:
      | string
      | { url: string; type?: string; length?: number; title?: string };
    copyright?: string;
  };
}

export function ReadingArticle({ item }: ReadingArticleProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const getImageUrl = (image: string | { url: string } | undefined) => {
    if (!image) return null;
    return typeof image === "string" ? image : image.url;
  };

  const parseContent = (content: string) => {
    if (!content) return [];

    // Remove HTML tags and clean up text
    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Split by sentences (periods followed by space and capital letter or end of string)
    const sentences = textContent
      .split(/\.\s+(?=[A-Z])/)
      .filter((s) => s.trim().length > 0);

    if (sentences.length === 0) return [];

    // First sentence becomes first paragraph
    const firstParagraph = sentences[0] + (sentences[0].endsWith('.') ? '' : '.');
    
    // All remaining sentences become second paragraph
    if (sentences.length > 1) {
      const remainingSentences = sentences.slice(1);
      const secondParagraph = remainingSentences
        .map(sentence => sentence + (sentence.endsWith('.') ? '' : '.'))
        .join(' ');
      
      return [firstParagraph, secondParagraph];
    }

    return [firstParagraph];
  };

  const contentParagraphs = item.content ? parseContent(item.content) : [];

  return (
    <article className="w-full max-w-4xl gap-[40px] flex flex-col">
      {/* 1. Title */}
      <h1 className="text-[40px] font-bold leading-[50px] text-center text-[#0A0A0A] font-Inter">
        {item.title}
      </h1>

      {/* 2. Meta Information Row */}
      <div className="flex flex-row items-center justify-center gap-4">
        {/* 2.1.1 Time div */}
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 6V12H16.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="#09090B"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#737373] font-Inter text-base font-normal leading-6">
            {formatTimeAgo(item.date)}
          </span>
        </div>

        {/* 2.1.2 Author div */}
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4 22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H8C7.46957 2 6.96086 2.21071 6.58579 2.58579C6.21071 2.96086 6 3.46957 6 4V20C6 20.5304 5.78929 21.0391 5.41421 21.4142C5.03914 21.7893 4.53043 22 4 22ZM4 22C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V11C2 9.9 2.9 9 4 9H6M18 14H10M15 18H10M10 6H18V10H10V6Z"
              stroke="#020617"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#737373] font-Inter text-base font-medium leading-6">
            From{" "}
            {item.author && item.author[0] ? item.author[0].name : "Unknown"}
          </span>
        </div>
      </div>

      {/* 3. Feed Image */}
      {getImageUrl(item.image) && (
        <div className="mb-10">
          <img
            src={getImageUrl(item.image)!}
            alt={item.title}
            className="w-full rounded-xl object-cover"
          />
        </div>
      )}

      {/* 4. Content Paragraphs */}
      {contentParagraphs.length > 0 && (
        <div className="flex flex-col">
          {/* First paragraph with special styling */}
          <p className="text-[#737373] font-Inter text-2xl font-light leading-[39px] mb-8">
            {contentParagraphs[0]}
          </p>

          {/* Subsequent paragraphs */}
          {contentParagraphs.slice(1).map((paragraph, index) => (
            <p
              key={index}
              className="text-[#0A0A0A] font-Inter text-lg font-normal leading-[29.25px] mb-6"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Fallback to description if no content */}
      {!item.content && item.description && (
        <div className="flex flex-col">
          <p className="text-[#737373] font-Inter text-2xl font-light leading-[39px] mb-8">
            {item.description}
          </p>
        </div>
      )}
    </article>
  );
}
