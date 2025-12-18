import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedPostContent } from '../types';
import { Heart, MessageCircle, Star, Copy, Check, MousePointerClick, Download, Share } from 'lucide-react';

interface PostPreviewProps {
  data: GeneratedPostContent | null;
  images: string[];
  isLoading: boolean;
  loadingStage: string;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ data, images, isLoading, loadingStage }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Parse content into slides
  const contentSlides = useMemo(() => {
    if (!data?.content) return [];
    // Split by '---' and filter out empty strings
    return data.content.split('---').map(s => s.trim()).filter(s => s.length > 0);
  }, [data]);

  // Reset selection when new data arrives
  useEffect(() => {
    if (images.length > 0) setSelectedImageIndex(0);
  }, [images, data]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('文案已复制到剪贴板！');
  };

  const handleCopyAll = () => {
    if (!data) return;
    const fullText = `${data.title}\n\n${data.content.replace(/---/g, '\n')}\n\n${data.tags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    alert('全部文案已复制！');
  };

  const handleDownloadImage = (e: React.MouseEvent, imgUrl: string, filename: string) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const currentCoverImage = images[selectedImageIndex] || null;

  // Helper to render text with highlights
  const renderHighlightedText = (text: string, index: number) => {
    // 1. Split lines to handle basic layout
    const lines = text.split('\n');
    
    return (
      <div className="flex flex-col h-full justify-center space-y-3 px-1">
        {lines.map((line, i) => {
            // Check if it's a "title" line (first line usually, or starts with specific chars)
            const isTitle = i === 0 || line.includes('【');
            
            // Regex to match **bold**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            
            return (
                <p key={i} className={`${isTitle ? 'text-lg font-black text-gray-900 mb-3 tracking-tight leading-snug' : 'text-sm font-medium text-gray-700 leading-relaxed tracking-wide'}`}>
                   {parts.map((part, partIdx) => {
                       if (part.startsWith('**') && part.endsWith('**')) {
                           return (
                               <span key={partIdx} className="bg-rose-500 text-white px-1 mx-0.5 rounded-[4px] shadow-sm font-bold text-xs align-middle inline-block py-0.5">
                                   {part.slice(2, -2)}
                               </span>
                           );
                       }
                       return part;
                   })}
                </p>
            )
        })}
      </div>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[500px]">
         <div className="relative">
             <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-xl">✨</span>
             </div>
         </div>
         <p className="text-sm font-medium animate-pulse text-rose-500">
            {loadingStage === 'GENERATING_TEXT' ? '正在规划笔记分页...' : '正在生成精美封面...'}
         </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[500px]">
        <div className="bg-white p-8 rounded-full mb-6 shadow-sm border border-gray-100">
          <svg className="w-16 h-16 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">输入灵感，生成图文笔记</p>
        <p className="text-sm text-gray-400 mt-2">自动生成 3:4 封面 + 分页文字图</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 items-center w-full">
      {/* Phone Frame */}
      <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border-[6px] border-gray-900 w-full max-w-[400px] flex-1 flex flex-col relative max-h-[850px]">
        {/* Header */}
        <div className="h-10 bg-white w-full flex items-center justify-between px-6 pt-2 shrink-0 z-20 border-b border-gray-50">
           <span className="text-[12px] font-bold ml-2">9:41</span>
           <div className="flex space-x-1.5 mr-2">
              <div className="w-4 h-2.5 bg-black rounded-sm"></div>
              <div className="w-0.5 h-2.5 bg-black rounded-sm"></div>
           </div>
        </div>

        {/* Content Area - Vertical Scroll - No Slider */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
          <div className="flex flex-col gap-4 p-4 pb-20">
            
            {/* Slide 0: Cover Image */}
            <div className="relative w-full aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-sm shrink-0 group">
                {currentCoverImage ? (
                <>
                    <img src={currentCoverImage} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 flex flex-col justify-end p-6 pb-8">
                        <h1 className="text-white text-xl font-bold leading-tight drop-shadow-md line-clamp-3">
                        {data.title}
                        </h1>
                        <div className="flex items-center space-x-2 mt-3">
                            <div className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            小红书博主
                            </div>
                            <span className="text-white/80 text-xs">@AI Copilot</span>
                        </div>
                    </div>
                    {/* Cover Download */}
                    <button 
                        onClick={(e) => handleDownloadImage(e, currentCoverImage, 'xhs-cover.png')}
                        className="absolute top-3 right-3 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="下载封面"
                    >
                        <Download size={16} />
                    </button>
                </>
                ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
                    <span className="text-gray-400">Loading Cover...</span>
                </div>
                )}
            </div>

            {/* Content Slides */}
            {contentSlides.map((slideText, index) => (
                <div key={index} className="relative w-full aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-sm shrink-0 group border border-gray-100">
                    {/* Background Image Layer (Blurred) */}
                    {currentCoverImage && (
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-110"
                            style={{ backgroundImage: `url(${currentCoverImage})` }}
                        />
                    )}
                    
                    {/* Glass Overlay */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md"></div>

                    {/* Content */}
                    <div className="relative h-full w-full p-6 flex flex-col z-10">
                        <div className="flex items-center justify-between mb-4 opacity-70">
                            <div className="flex items-center space-x-2">
                                <div className="h-1 w-6 bg-rose-400 rounded-full"></div>
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Step {index + 1}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">{index + 1} / {contentSlides.length}</span>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                            {renderHighlightedText(slideText, index)}
                        </div>

                        {/* Copy Button for Text Slides */}
                        <button 
                            onClick={() => handleCopy(slideText)}
                            className="absolute top-3 right-3 bg-black/5 backdrop-blur-md p-2 rounded-full text-gray-600 hover:bg-rose-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="复制本页文字"
                        >
                            <Copy size={14} />
                        </button>

                        <div className="mt-2 pt-2 border-t border-gray-300/50 flex justify-between items-center text-gray-400 text-[9px] uppercase tracking-widest shrink-0">
                            <span>XHS Copilot</span>
                            <span>Swipe for more</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Tags Section at the bottom of the list */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag, i) => (
                    <span key={i} className="text-[#133C65] text-xs font-medium bg-blue-50 px-2 py-1 rounded">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                    ))}
                </div>
                <button 
                    onClick={handleCopyAll}
                    className="mt-4 w-full py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 flex items-center justify-center space-x-2"
                >
                    <Copy size={12} />
                    <span>复制全部文案 & 标签</span>
                </button>
            </div>

          </div>
        </div>

        {/* Bottom Action Bar (Sticky) */}
        <div className="bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between pb-6 shrink-0 z-20">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 mr-6 text-gray-400 text-xs">
              说点什么...
          </div>
          <div className="flex items-center space-x-5 text-gray-700">
              <Heart size={20} />
              <Star size={20} />
              <MessageCircle size={20} />
          </div>
        </div>
      </div>

      {/* Image Selection Strip */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex flex-col space-y-3 w-full max-w-[400px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-800">
                    <MousePointerClick size={16} className="text-rose-500" />
                    <span className="text-sm font-bold">更换主题风格 ({images.length})</span>
                </div>
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group shrink-0">
                        <button
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative w-14 h-18 rounded-lg overflow-hidden shrink-0 transition-all duration-200 ${
                                selectedImageIndex === idx 
                                    ? 'ring-2 ring-rose-500 ring-offset-1 scale-105' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt={`Style ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
