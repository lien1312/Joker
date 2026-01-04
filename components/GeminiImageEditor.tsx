import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Upload, Wand2, Loader2, Download } from 'lucide-react';

const GeminiImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API if needed, but display needs it.
        // The service will handle extraction or we pass clean base64.
        // For local preview:
        setSelectedImage(base64String);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract pure base64
      const base64Data = selectedImage.split(',')[1];
      const resultBase64 = await editImage(base64Data, prompt);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      setError("AI 處理失敗，請稍後再試。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100">
      <h2 className="text-2xl font-bold text-cny-dark mb-4 flex items-center gap-2">
        <Wand2 className="w-6 h-6 text-cny-gold" />
        AI 新年賀卡魔法師
      </h2>
      <p className="text-gray-600 mb-6">
        上傳一張照片，輸入指令（例如：「加上春節邊框」、「把背景換成煙火」），讓 AI 幫你製作獨一無二的賀卡！
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-red-200 rounded-lg h-64 flex flex-col items-center justify-center bg-red-50 cursor-pointer hover:bg-red-100 transition-colors relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Original" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-4">
                <Upload className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <span className="text-gray-500">點擊上傳圖片</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
          </div>

          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cny-red focus:border-transparent outline-none"
            rows={3}
            placeholder="請輸入 AI 指令... (例如：加上金色的龍在旁邊)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={handleGenerate}
            disabled={!selectedImage || !prompt || isLoading}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-white transition-all ${
              !selectedImage || !prompt || isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cny-red to-cny-dark hover:shadow-lg'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {isLoading ? 'AI 施法中...' : '開始生成'}
          </button>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Output Section */}
        <div className="border-2 border-gray-100 rounded-lg h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 relative">
          {generatedImage ? (
            <>
              <img src={generatedImage} alt="Generated" className="w-full h-full object-contain p-2" />
              <a 
                href={generatedImage} 
                download="cny-card.png"
                className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md text-cny-red hover:bg-gray-100"
              >
                <Download />
              </a>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <Wand2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>生成的圖片將顯示在這裡</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiImageEditor;