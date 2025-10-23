import { useEffect, useState } from "react";
import caioLoadingImg from "@/assets/caio-loading.png";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--bradesco-red))] to-[hsl(var(--bradesco-dark-red))]">
      <img
        src={caioLoadingImg}
        alt="Caio"
        className="w-32 h-32 mb-8 animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
        style={{
          animation: "fadeInLogo 1.5s ease-in-out infinite alternate",
        }}
      />
      
      <div className="text-center text-white">
        <p className="text-xl font-semibold mb-4">
          {progress < 100 ? `Carregando... ${progress}%` : "✅ PRONTO PARA FALAR COM O CAIO? BEM-VINDO!"}
        </p>
        
        <div className="w-[300px] h-4 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-white to-yellow-300 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.5)_10%,_transparent_70%)] opacity-70 blur-md" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLogo {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
