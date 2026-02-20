import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="container py-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-gray-600">Dernière mise à jour : Février 2026</p>
      </div>

      <div className="container max-w-4xl pb-12">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            VINA ("nous", "notre" ou "nos") exploite la plateforme
            VINA. Cette page vous informe de nos politiques concernant la
            collecte, l'utilisation et la divulgation de données personnelles
            lorsque vous utilisez notre service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Collecte de données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous collectons plusieurs types de données :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              <strong>Informations de compte :</strong> nom, e-mail, mot de passe
            </li>
            <li>
              <strong>Informations de paiement :</strong> traitées via Stripe
            </li>
            <li>
              <strong>Données de navigation :</strong> pages visitées, temps
              passé
            </li>
            <li>
              <strong>Données de profil :</strong> bio, avatar, informations
              créateur
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Utilisation des données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous utilisons vos données pour :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Fournir et maintenir notre service</li>
            <li>Traiter vos transactions</li>
            <li>Vous envoyer des mises à jour et des notifications</li>
            <li>Améliorer notre plateforme</li>
            <li>Détecter et prévenir la fraude</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Partage de données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous ne vendons pas vos données personnelles. Nous pouvons les
            partager avec :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Nos prestataires de services (Stripe, hébergement)</li>
            <li>Les autorités légales si requis par la loi</li>
            <li>Les créateurs pour les informations de commande</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Sécurité des données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous mettons en œuvre des mesures de sécurité appropriées pour
            protéger vos données personnelles contre l'accès non autorisé et la
            modification.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Cookies
          </h2>
          <p className="text-gray-700 mb-4">
            Nous utilisons des cookies pour améliorer votre expérience. Vous
            pouvez contrôler les cookies via les paramètres de votre navigateur.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Vos droits
          </h2>
          <p className="text-gray-700 mb-4">
            Vous avez le droit de :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Accéder à vos données personnelles</li>
            <li>Corriger vos données</li>
            <li>Supprimer votre compte</li>
            <li>Vous opposer au traitement de vos données</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Conservation des données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous conservons vos données aussi longtemps que nécessaire pour
            fournir nos services et respecter nos obligations légales.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Modifications de cette politique
          </h2>
          <p className="text-gray-700 mb-4">
            Nous pouvons mettre à jour cette politique de confidentialité de
            temps en temps. Nous vous informerons de tout changement en
            publiant la nouvelle politique sur cette page.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Contact
          </h2>
          <p className="text-gray-700 mb-4">
            Si vous avez des questions concernant cette politique de
            confidentialité, veuillez nous contacter à privacy@vina.tn.
          </p>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            Votre vie privée est importante pour nous. Si vous avez des
            préoccupations concernant le traitement de vos données, veuillez
            nous contacter immédiatement.
          </p>
        </div>
      </div>
    </div>
  );
}
