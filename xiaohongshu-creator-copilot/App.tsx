import React, { useState } from 'react';
import { generatePostText, generatePostImages } from './services/geminiService';
import { GeneratedPostContent, LoadingStage } from './types';
import { PostPreview } from './components/PostPreview';
import { Sparkles, Image as ImageIcon, PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [inspiration, setInspiration] = useState('');
  const [generatedData, setGeneratedData] = useState<GeneratedPostContent | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(LoadingStage.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inspiration.trim()) return;

    setLoadingStage(LoadingStage.GENERATING_TEXT);
    setError(null);
    setGeneratedData(null);
    setGeneratedImages([]);

    try {
      // 1. Generate Text
      const data = await generatePostText(inspiration);
      setGeneratedData(data);
      
      // 2. Generate Images (5 variations)
      setLoadingStage(LoadingStage.GENERATING_IMAGE);
      const images = await generatePostImages(data.imagePrompt, 5);
      setGeneratedImages(images);
      
      setLoadingStage(LoadingStage.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成过程中发生错误，请重试。');
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleGenerate();
    }
  };

  const isLoading = loadingStage === LoadingStage.GENERATING_TEXT || loadingStage === LoadingStage.GENERATING_IMAGE;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-800 flex flex-col md:flex-row">
      
      {/* Left Panel: Input & Controls */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-6 md:p-12 flex flex-col h-screen overflow-y-auto border-r border-gray-100">
        <header className="mb-10">
          <div className="flex items-center space-x-2 text-rose-500 mb-2">
            <Sparkles size={24} />
            <span className="font-bold text-xl tracking-tight">XHS Copilot</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            灵感生成 <br/> 
            <span className="text-rose-500">爆款笔记</span>
          </h1>
          <p className="text-gray-500 text-lg">
            输入你的简单想法，AI 帮你生成<b>保姆级 Step-by-Step 教程</b>，并自动绘制 <b>5 张可选配图</b>。
          </p>
        </header>

        <div className="flex-1 flex flex-col space-y-6">
          <div className="relative group">
            <textarea
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：想写一篇关于如何在家制作手冲咖啡的教程，要非常详细步骤，适合新手..."
              className="w-full h-48 p-6 bg-white border-2 border-gray-100 rounded-3xl resize-none text-lg placeholder-gray-300 focus:outline-none focus:border-rose-400 transition-all shadow-sm group-hover:shadow-md"
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none">
              ⌘ + Enter 发送
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !inspiration.trim()}
            className={`
              w-full py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95
              ${isLoading || !inspiration.trim() 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200'}
            `}
          >
            {isLoading ? (
              <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 <span>
                    {loadingStage === 'GENERATING_TEXT' ? '正在构思干货文案...' : '正在绘制 5 张美图...'}
                 </span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>立即生成</span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Features List */}
          <div className="mt-auto py-8">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">功能亮点</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-gray-600">
                   <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                      <PenTool size={18} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold">保姆级教程</span>
                     <span className="text-xs text-gray-400">Step-by-Step 实操</span>
                   </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                   <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                      <ImageIcon size={18} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold">5张可选配图</span>
                     <span className="text-xs text-gray-400">不同风格自动生成</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full md:w-1/2 lg:w-7/12 bg-gray-50 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-center">
            <PostPreview 
              data={generatedData} 
              images={generatedImages} 
              isLoading={isLoading} 
              loadingStage={loadingStage}
            />
            
            {generatedData && (
               <div className="mt-8 text-center">
                  <p className="text-xs text-gray-400 mb-2">AI 生成内容仅供参考</p>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;