// components/News/NewsCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaNewspaper } from 'react-icons/fa';
import type { NewsArticle } from '@/types/news';

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, index }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100"
    >
      {/* Image Container */}
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block relative h-48 w-full overflow-hidden bg-gray-100">
        {article.urlToImage ? (
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br', 'from-blue-100', 'to-purple-100');
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <FaNewspaper className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Source and Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {article.source.name}
          </span>
          <div className="flex items-center">
            <FaCalendarAlt className="w-3 h-3 mr-1" />
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
        </div>

        {/* Title */}
        <Link href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
          {article.description || 'No description available.'}
        </p>

        {/* Read More Link */}
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mt-auto"
        >
          Read full article
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </motion.article>
  );
};

export default NewsCard;