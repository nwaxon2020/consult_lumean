'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlayCircle, FaTimes, FaNewspaper, FaChevronLeft, FaChevronRight, FaExpand, FaImage, FaFileVideo } from 'react-icons/fa';

export const BlogHub = ({ advert }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Logic to determine if media is YouTube or Local
  const getMediaInfo = (article: any) => {
    const url = article.mediaUrl || "";
    const isYouTube = article.type === 'video' && (url.length === 11 && !url.includes('.') && !url.includes('/'));
    return { isYouTube, url };
  };

  // Get thumbnail/preview image for ANY media type
  const getMediaPreview = (article: any) => {
    // If it's an image type, return the image URL
    if (article.type === 'image') {
      return article.mediaUrl;
    }
    
    // If it's a video
    if (article.type === 'video') {
      const { isYouTube, url } = getMediaInfo(article);
      
      // YouTube video - use thumbnail
      if (isYouTube) {
        return `https://img.youtube.com/vi/${url}/hqdefault.jpg`;
      }
      
      // Local video - use thumbnail if provided
      if (article.thumbnail) {
        return article.thumbnail;
      }
      
      // Local video without thumbnail - use default video placeholder
      return 'https://images.unsplash.com/photo-1536240474400-95dda128b6aa?auto=format&fit=crop&w=500&q=80';
    }
    
    // Default fallback
    return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80';
  };

  const renderVideoPlayer = (article: any, isPreview = false) => {
    const { isYouTube, url } = getMediaInfo(article);
    
    if (isYouTube) {
      return (
        <iframe
          className="w-full h-full pointer-events-none border-0"
          src={`https://www.youtube.com/embed/${url}?autoplay=1&mute=${isPreview ? 1 : 0}&controls=${isPreview ? 0 : 1}&loop=1&playlist=${url}&rel=0`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      );
    }
    
    return (
      <video 
        muted={isPreview}
        autoPlay 
        loop 
        playsInline
        className="w-full h-full object-cover bg-black"
      >
        <source src={url} type="video/mp4" />
      </video>
    );
  };

  return (
    <>
      {/* Main Page Card */}
      <motion.div
        whileHover={{ y: -8 }}
        onClick={() => setIsOpen(true)}
        className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-[400px] w-full group"
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" 
             style={{ backgroundImage: `url(${advert.bgImage})` }} />
        <div className={`absolute inset-0 bg-gradient-to-t ${advert.color} opacity-85 group-hover:opacity-90`} />
        <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4"><FaNewspaper size={24} /></div>
          <h2 className="text-3xl font-black mb-2">{advert.title}</h2>
          <p className="text-white/90 text-lg mb-6 tracking-tight">Moments from Dr. Prince.N's journey.</p>
          <button className="w-fit px-6 py-2 bg-white text-purple-900 rounded-xl font-bold uppercase tracking-wider">Read Blog</button>
        </div>
      </motion.div>

      {/* Main Grid Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-xl md:rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="p-4 md:p-6 flex justify-between items-center bg-gray-50 shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-purple-900">{advert.title}</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Desktop Scroll Buttons */}
              <button 
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
              >
                <FaChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-4 top-1/2 z-20 bg-white/90 p-3 rounded-full shadow-lg text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
              >
                <FaChevronRight size={20} />
              </button>
              
              <div ref={scrollRef} className="overflow-y-auto md:overflow-y-hidden md:overflow-x-auto scrollbar-hide scroll-smooth">
                <div className="flex flex-col md:flex-row md:flex-nowrap gap-6 p-4 md:p-10 md:pr-20 min-h-fit">
                  {advert.articles.map((article: any) => {
                    const previewUrl = getMediaPreview(article);
                    const { isYouTube } = getMediaInfo(article);

                    return (
                      <motion.div 
                        key={article.id} 
                        whileHover={{ y: -5 }} 
                        onMouseEnter={() => setHoveredCard(article.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => setSelectedEvent(article)}
                        className="flex-none w-full md:w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group border border-gray-100"
                      >
                        <div className="relative h-48 md:h-52 w-full bg-gray-100">
                          {/* Show video player on hover, otherwise show thumbnail */}
                          {article.type === 'video' && hoveredCard === article.id ? (
                            <div className="absolute inset-0 z-10">
                              {renderVideoPlayer(article, true)}
                            </div>
                          ) : (
                            <>
                              {/* ALWAYS show preview image when not hovering video */}
                              <img 
                                src={previewUrl} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                alt={article.title}
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80';
                                }}
                              />
                              
                              {/* Play button overlay for videos */}
                              {article.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                  <div className="bg-purple-600/90 rounded-full p-4 transform group-hover:scale-110 transition-transform shadow-xl">
                                    <FaPlayCircle className="text-white text-3xl" />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Type badge */}
                          <div className="absolute top-3 left-3 z-20">
                            {article.type === 'video' ? (
                              <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                <FaFileVideo size={12} />
                                <span>Video</span>
                              </span>
                            ) : (
                              <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                                <FaImage size={12} />
                                <span>Photo</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mt-2 leading-relaxed">
                            {article.description}
                          </p>
                          
                          {/* Meta info */}
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                            <span>{article.date || 'Recent'}</span>
                            <span>•</span>
                            <span>{article.readTime || '2 min read'}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div className="hidden md:block flex-none w-10 h-10 invisible" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMART DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-lg flex items-center justify-center p-2 md:p-6"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }}
              className="bg-white w-full max-w-4xl h-[95vh] md:h-[80vh] rounded-xl md:rounded-3xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full z-20 hover:bg-red-600 transition-all"
              >
                <FaTimes size={20} />
              </button>
              
              <div className="w-full h-[60%] md:h-full md:w-[60%] bg-black shrink-0 relative group/media">
                 {selectedEvent.type === 'video' ? (
                   renderVideoPlayer(selectedEvent, false)
                 ) : (
                   <div 
                     className="w-full h-full cursor-zoom-in relative" 
                     onClick={(e) => {
                       e.stopPropagation();
                       setFullImage(selectedEvent.mediaUrl);
                     }}
                   >
                      <img 
                        src={selectedEvent.mediaUrl} 
                        className="w-full h-full object-contain md:object-cover" 
                        alt={selectedEvent.title}
                        onError={(e) => {
                          // Fallback for detail view
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/40 flex items-center justify-center transition-all">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity">
                          <FaExpand className="text-white text-2xl" />
                        </div>
                      </div>
                   </div>
                 )}
              </div>
              
              <div className='p-6 md:p-10 h-[40%] md:h-full md:w-[40%] overflow-y-auto bg-white scrollbar-hide'>
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs mb-2 uppercase tracking-widest">
                    <FaNewspaper /> Featured Story
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight italic leading-tight">
                  {selectedEvent.title}
                </h2>
                <div className="h-1.5 w-16 bg-purple-600 mb-6 rounded-full" />
                <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-medium">
                  {selectedEvent.longDescription || selectedEvent.description}
                </p>
                
                <button 
                    onClick={() => setSelectedEvent(null)}
                    className="mt-10 mb-6 w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-purple-900 transition-all shadow-lg"
                >
                    Close Story
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox for Images */}
      <AnimatePresence>
        {fullImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setFullImage(null)}
          >
            <button 
              onClick={() => setFullImage(null)}
              className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-30 bg-black/30 p-3 rounded-full backdrop-blur"
            >
              <FaTimes size={30} />
            </button>
            <motion.img 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }}
              src={fullImage} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              alt="Full size"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80';
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
