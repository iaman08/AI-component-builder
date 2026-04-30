// src/App.tsx
// purpose: main app shell with gemini integration + visual preview

import { useState, useCallback } from 'react';
import { generateComponent } from "./services/gemini.ts";
import type { GenerationState, GalleryState } from './types';
import { Sidebar } from './prompt-input';

// clean gemini output (simple version)
const cleanGeneratedCode = (raw: string): string => {
  let code = raw.trim();

  // remove markdown fences if present
  code = code.replace(/^```(?:html)?\s*/i, '');
  code = code.replace(/```$/, '');

  return code.trim();
};

export const App = () => {
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [galleryState] = useState<GalleryState>({ status: 'idle' });

  const handleGenerate = useCallback(async (prompt: string) => {
    setGenerationState({ status: 'loading' });

    try {
      const raw = await generateComponent(prompt);
      const code = cleanGeneratedCode(raw);

      if (!code) {
        setGenerationState({
          status: 'error',
          message: 'No code generated',
        });
        return;
      }

      setGenerationState({
        status: 'success',
        code,
        prompt,
      });

    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Generation failed';

      setGenerationState({ status: 'error', message });
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <Sidebar
        onGenerate={handleGenerate}
        isLoading={generationState.status === 'loading'}
        apiKey={""}
        onApiKeySave={() => {}}
      />

      {/* CENTER PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">

        {generationState.status === 'idle' && (
          <p className="text-gray-500 text-sm">
            Describe a component to generate UI
          </p>
        )}

        {generationState.status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Generating...</p>
          </div>
        )}

        {generationState.status === 'error' && (
          <p className="text-red-400">{generationState.message}</p>
        )}

        {generationState.status === 'success' && (
          <div className="w-full h-full">
            <iframe
              className="w-full h-full rounded-lg bg-white"
              srcDoc={`
                <html>
                  <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                  </head>
                  <body class="p-4">
                    ${generationState.code}
                  </body>
                </html>
              `}
            />
          </div>
        )}

      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="w-48 bg-gray-900 border-l border-gray-800 flex items-center justify-center">
        <p className="text-xs text-gray-500">Gallery - coming soon</p>
      </aside>

    </div>
  );
};