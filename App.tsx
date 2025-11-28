import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { generateEditedImage } from './services/geminiService';
import { AppStatus, ImageState } from './types';

function App() {
  const [sourceImage, setSourceImage] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
    mimeType: null,
  });
  
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggestions for users
  const suggestions = [
    "Change the t-shirt to a tuxedo",
    "Wear a red floral summer dress",
    "Add a leather jacket",
    "Change the background to a beach",
    "Add a superhero cape",
    "Wear a futuristic space suit"
  ];

  const handleImageSelected = (imageState: ImageState) => {
    setSourceImage(imageState);
    setGeneratedImageUrl(null);
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
  };

  const handleClearImage = () => {
    setSourceImage({ file: null, previewUrl: null, base64: null, mimeType: null });
    setGeneratedImageUrl(null);
    setPrompt('');
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!sourceImage.base64 || !sourceImage.mimeType || !prompt.trim()) return;

    setStatus(AppStatus.GENERATING);
    setErrorMsg(null);

    try {
      const result = await generateEditedImage(
        sourceImage.base64,
        sourceImage.mimeType,
        prompt
      );

      if (result) {
        setGeneratedImageUrl(result);
        setStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("Failed to generate image.");
      }
    } catch (err: any) {
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `styleswap-edited-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              StyleSwap AI
            </span>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Input */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">1. Upload Image</h2>
              <p className="text-slate-400">Choose a photo you want to transform.</p>
            </div>

            <ImageUploader 
              onImageSelected={handleImageSelected} 
              currentImage={sourceImage.previewUrl} 
              onClear={handleClearImage}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">2. Describe Change</h2>
                <p className="text-slate-400">What do you want to change in the image?</p>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Change the white t-shirt to a black leather jacket..."
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-0 transition-colors resize-none h-32"
                  disabled={status === AppStatus.GENERATING}
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                  {prompt.length} chars
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(s)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  <p className="font-semibold">Error</p>
                  <p>{errorMsg}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!sourceImage.base64 || !prompt.trim() || status === AppStatus.GENERATING}
                isLoading={status === AppStatus.GENERATING}
                className="w-full py-4 text-lg shadow-xl shadow-blue-500/20"
              >
                {status === AppStatus.GENERATING ? 'Transforming...' : 'Generate Transformation'}
              </Button>
            </div>
          </section>

          {/* Right Column: Output */}
          <section className="lg:sticky lg:top-24 space-y-6">
             <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">3. Result</h2>
              <p className="text-slate-400">Your AI-generated style swap.</p>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
              {status === AppStatus.GENERATING ? (
                <div className="text-center space-y-4 p-8">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-300 font-medium animate-pulse">
                    Thinking about fashion...
                  </p>
                  <p className="text-xs text-slate-500">This usually takes 5-10 seconds</p>
                </div>
              ) : generatedImageUrl ? (
                <div className="relative w-full h-full group">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated" 
                    className="w-full h-full object-contain bg-slate-900" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <Button onClick={handleDownload} variant="primary" className="w-full">
                      Download Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500">
                   <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Your generated image will appear here.</p>
                </div>
              )}
            </div>
            
            {status === AppStatus.SUCCESS && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg flex items-start space-x-3">
                 <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium">Transformation Complete!</p>
                  <p className="opacity-80 mt-1">Don't forget to download your image if you want to keep it.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;