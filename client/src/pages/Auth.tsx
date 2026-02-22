import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingBag, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Auth() {
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const utils = trpc.useUtils();

  const isRegister = location === "/register" || location === "/auth";
  const redirectTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("redirect") || "/"
    : "/";

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Connexion réussie !");
      setLocation(redirectTo);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la connexion");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Compte créé ! Vous êtes connecté.");
      setLocation(redirectTo);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'inscription");
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
    });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.003_65)]">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8c8070] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl">V</span>
                </div>
                <span className="text-xl md:text-2xl font-bold text-[oklch(0.35_0.02_65)]">VINA</span>
              </div>
            </Link>
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-[#c8bfb0] focus:border-[#8c8070] bg-[oklch(0.97_0.003_65)]"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b4aa9b]" />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/cart">
                <button className="p-2 hover:bg-[oklch(0.97_0.003_65)] rounded-lg transition-colors relative">
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-[oklch(0.35_0.02_65)]" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-md mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-[#8c8070] hover:text-[#6d6458] font-medium mb-6">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </button>
            </Link>

            <div className="flex gap-2 mb-4">
              <Link href="/login">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isRegister ? "bg-[#8c8070] text-white" : "bg-white text-[oklch(0.35_0.02_65)] border border-[#c8bfb0] hover:bg-[oklch(0.97_0.003_65)]"
                  }`}
                >
                  Connexion
                </button>
              </Link>
              <Link href="/register">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRegister ? "bg-[#8c8070] text-white" : "bg-white text-[oklch(0.35_0.02_65)] border border-[#c8bfb0] hover:bg-[oklch(0.97_0.003_65)]"
                  }`}
                >
                  Inscription
                </button>
              </Link>
            </div>

            <Card className="border-[#c8bfb0] shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-[oklch(0.35_0.02_65)]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {isRegister ? "Créer un compte" : "Connexion"}
                </CardTitle>
                <CardDescription className="text-[oklch(0.55_0.016_65)]">
                  {isRegister ? "Inscrivez-vous pour commander et suivre vos achats" : "Connectez-vous à votre compte client"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isRegister ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">Nom</label>
                      <Input
                        type="text"
                        placeholder="Votre nom"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        minLength={2}
                        className="border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">Email</label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">Mot de passe (min. 6 caractères)</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pr-10 border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b4aa9b] hover:text-[#8c8070]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#8c8070] hover:bg-[#6d6458] text-white py-3"
                      disabled={isLoading}
                    >
                      {registerMutation.isPending ? "Création du compte..." : "S'inscrire"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">Email</label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">Mot de passe</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="pr-10 border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b4aa9b] hover:text-[#8c8070]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-[oklch(0.35_0.02_65)]">
                        <input type="checkbox" className="rounded border-[#c8bfb0] text-[#8c8070] focus:ring-[#8c8070]" />
                        Se souvenir de moi
                      </label>
                      <button
                        type="button"
                        onClick={() => toast.info("Veuillez contacter le support pour réinitialiser votre mot de passe.")}
                        className="text-[#8c8070] hover:text-[#6d6458] cursor-pointer"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#8c8070] hover:bg-[#6d6458] text-white py-3"
                      disabled={isLoading}
                    >
                      {loginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-[oklch(0.35_0.02_65)] text-[oklch(0.92_0.005_65)] py-12">
        <div className="container px-4">
          <div className="border-t border-[oklch(0.40_0.01_65)] pt-8 text-center text-sm text-[oklch(0.55_0.016_65)]">
            <p>&copy; 2024 VINA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
