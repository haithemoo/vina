import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingBag, Heart, Menu, X, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login - in real app, call API
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    setIsLoading(true);
    // Simulate registration - in real app, call API
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.003_65)]">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8c8070] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl">V</span>
                </div>
                <span className="text-xl md:text-2xl font-bold text-[oklch(0.35_0.02_65)]">VINA</span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
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

            {/* Right Actions */}
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

      {/* Auth Section */}
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-md mx-auto">
            {/* Back Link */}
            <Link href="/">
              <button className="flex items-center gap-2 text-[#8c8070] hover:text-[#6d6458] font-medium mb-6">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </button>
            </Link>

            <Card className="border-[#c8bfb0] shadow-lg">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-[oklch(0.35_0.02_65)]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Bienvenue chez VINA
                </CardTitle>
                <CardDescription className="text-[oklch(0.55_0.016_65)]">
                  Connectez-vous ou créez un compte
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[oklch(0.97_0.003_65)] mb-6">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-[#8c8070] data-[state=active]:text-white text-[oklch(0.35_0.02_65)]"
                    >
                      Se connecter
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="data-[state=active]:bg-[#8c8070] data-[state=active]:text-white text-[oklch(0.35_0.02_65)]"
                    >
                      S'inscrire
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">
                          Email
                        </label>
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
                        <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">
                          Mot de passe
                        </label>
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
                        <Link href="/forgot-password">
                          <span className="text-[#8c8070] hover:text-[#6d6458] cursor-pointer">
                            Mot de passe oublié ?
                          </span>
                        </Link>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-[#8c8070] hover:bg-[#6d6458] text-white py-3"
                        disabled={isLoading}
                      >
                        {isLoading ? "Connexion en cours..." : "Se connecter"}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#c8bfb0]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-[oklch(0.55_0.016_65)]">ou</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full border-[#c8bfb0] text-[oklch(0.35_0.02_65)] hover:bg-[oklch(0.97_0.003_65)]"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </Button>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">
                          Nom complet
                        </label>
                        <Input
                          type="text"
                          placeholder="Votre nom"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          required
                          className="border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">
                          Email
                        </label>
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
                        <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
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

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[oklch(0.35_0.02_65)]">
                          Confirmer le mot de passe
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          required
                          className="border-[#c8bfb0] focus:border-[#8c8070] focus:ring-[#8c8070]"
                        />
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          required
                          className="mt-1 rounded border-[#c8bfb0] text-[#8c8070] focus:ring-[#8c8070]" 
                        />
                        <span className="text-[oklch(0.55_0.016_65)]">
                          J'accepte les{" "}
                          <Link href="/terms">
                            <span className="text-[#8c8070] hover:text-[#6d6458] cursor-pointer">
                              conditions d'utilisation
                            </span>
                          </Link>
                          {" "}et la{" "}
                          <Link href="/privacy">
                            <span className="text-[#8c8070] hover:text-[#6d6458] cursor-pointer">
                              politique de confidentialité
                            </span>
                          </Link>
                        </span>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-[#8c8070] hover:bg-[#6d6458] text-white py-3"
                        disabled={isLoading}
                      >
                        {isLoading ? "Inscription en cours..." : "Créer un compte"}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#c8bfb0]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-[oklch(0.55_0.016_65)]">ou</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full border-[#c8bfb0] text-[oklch(0.35_0.02_65)] hover:bg-[oklch(0.97_0.003_65)]"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      S'inscrire avec Google
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="justify-center pb-6">
                <p className="text-sm text-[oklch(0.55_0.016_65)]">
                  Vous avez déjà un compte ?{" "}
                  <button 
                    onClick={() => document.querySelector('[data-state="login"]')?.click()}
                    className="text-[#8c8070] hover:text-[#6d6458] font-medium cursor-pointer"
                  >
                    Se connecter
                  </button>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[oklch(0.35_0.02_65)] text-[oklch(0.92_0.005_65)] py-12">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#8c8070] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-white">VINA</span>
              </div>
              <p className="text-sm text-[oklch(0.70_0.015_65)]">
                Votre destination mode pour des vêtements et accessoires de qualité.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Boutique</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Hommes</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Femmes</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Accessoires</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Soldes</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Aide</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help"><span className="hover:text-[#b4aa9b] transition-colors">Centre d'aide</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Livraison</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Retours</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms"><span className="hover:text-[#b4aa9b] transition-colors">CGV</span></Link></li>
                <li><Link href="/privacy"><span className="hover:text-[#b4aa9b] transition-colors">Confidentialité</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[oklch(0.40_0.01_65)] pt-8 text-center text-sm text-[oklch(0.55_0.016_65)]">
            <p>&copy; 2024 VINA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

