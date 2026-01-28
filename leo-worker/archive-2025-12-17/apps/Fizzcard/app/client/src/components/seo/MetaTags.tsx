import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile';
}

export function MetaTags({
  title = 'FizzCard - Smart Contact Sharing with Crypto Rewards',
  description = 'Connect, share, and earn FizzCoins with every networking interaction. The future of digital business cards powered by blockchain.',
  image = 'https://fizzcard.app/og-image.png',
  url,
  type = 'website',
}: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    updateMetaTag('name', 'description', description);

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:type', type);
    if (url) {
      updateMetaTag('property', 'og:url', url);
    }

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);
  }, [title, description, image, url, type]);

  return null;
}

function updateMetaTag(attribute: string, key: string, value: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', value);
}
