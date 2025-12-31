import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { GemininService } from '@/services/gemini';
import { Loader2 } from 'lucide-react';

export default function SettingsDialog() {
    const { apiKey, setApiKey } = useAppStore();
    const [inputKey, setInputKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If apiKey exists in store, we don't show the modal (unless we add a "re-open" feature later)
    // The requirements say: "If null, show the dialog (cannot be closed)."
    if (apiKey) return null;

    const handleSave = async () => {
        if (!inputKey.trim()) {
            setError("API Key cannot be empty");
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Validation: Call with dummy text
            await GemininService.analyzeTranscript(inputKey, "Hello world", "gemini-1.5-flash");
            // If no error thrown, it's valid
            setApiKey(inputKey);
        } catch (err) {
            console.error("API Key Validation Failed:", err);
            setError("Invalid API Key or Network Error. Please check your key.");
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Welcome to Cubit Connect</h2>
                <p className="text-zinc-400 text-sm mb-6">
                    To get started, please enter your Google Gemini API Key.
                    This is stored locally on your device (LocalStorage).
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isValidating}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            "Save & Continue"
                        )}
                    </button>

                    <p className="text-center text-xs text-zinc-600">
                        Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Get one here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
