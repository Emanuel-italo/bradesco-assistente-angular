import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Loader2 } from "lucide-react";
import caioAvatar from "@/assets/caio-avatar.jpeg";

interface LoginScreenProps {
    onLoginSuccess: (user: string, area: string) => void;
}

const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // SIMULAÇÃO DE VALIDAÇÃO DE CREDENCIAIS (Backend faria isso)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Usuários permitidos para teste
        if (username === "admin" && password === "123456") {
            onLoginSuccess("Administrador", "Financeiro");
        } else if (username === "gestor" && password === "123456") {
            onLoginSuccess("Gestor de Contratos", "Compras");
        } else {
            setError("Usuário ou senha inválidos.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--bradesco-red))] to-[hsl(var(--bradesco-dark-red))] p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 text-center border-b border-gray-100">
                    <div className="relative inline-block mb-4">
                        <img
                            src={caioAvatar}
                            alt="Caio"
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
                        />
                        <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
                    <p className="text-gray-500 text-sm">Assistente Virtual de Pagamentos</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Usuário Corporativo</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="username"
                                className="pl-10"
                                placeholder="Ex: admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha de Rede</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type="password"
                                className="pl-10"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-[hsl(var(--bradesco-red))] hover:bg-[hsl(var(--bradesco-dark-red))]"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...
                            </>
                        ) : (
                            "Entrar no Sistema"
                        )}
                    </Button>
                </form>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    Ambiente Seguro &copy; 2025 - Bradesco
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;