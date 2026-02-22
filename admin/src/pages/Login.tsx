import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      const backOfficeRoles = ["admin", "stock", "sales", "purchase", "designer"];
      if (backOfficeRoles.includes(data.role as string)) {
        setError("");
        utils.auth.me.invalidate();
        setLocation("/admin");
      } else {
        setError("Accès réservé au back office.");
        logoutMutation.mutate();
      }
    },
    onError: (err) => {
      setError(err.message ?? "Erreur de connexion.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-[#8c8070] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">V</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            VINA Admin
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            Connectez-vous pour accéder au back office
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8c8070] focus:border-[#8c8070] outline-none"
                  placeholder="admin@vina.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8c8070] focus:border-[#8c8070] outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 bg-[#8c8070] hover:bg-[#6d6458] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Compte par défaut : admin@vina.com / AdminVina2025!
          </p>
        </div>
      </div>
    </div>
  );
}
