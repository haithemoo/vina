import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="container py-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Conditions d'utilisation
        </h1>
        <p className="text-gray-600">Dernière mise à jour : Février 2026</p>
      </div>

      <div className="container max-w-4xl pb-12">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. Acceptation des conditions
          </h2>
          <p className="text-gray-700 mb-4">
            En accédant et en utilisant VINA, vous acceptez d'être lié par
            ces conditions d'utilisation. Si vous n'acceptez pas ces conditions,
            veuillez ne pas utiliser notre plateforme.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. Licence d'utilisation
          </h2>
          <p className="text-gray-700 mb-4">
            VINA vous accorde une licence limitée, non exclusive et
            révocable pour utiliser notre plateforme à des fins personnelles et
            non commerciales, sauf indication contraire.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. Droits de propriété intellectuelle
          </h2>
          <p className="text-gray-700 mb-4">
            Tous les contenus, logos, et marques sur VINA sont la propriété
            de VINA ou de ses fournisseurs de contenu. Les créateurs
            conservent les droits sur leurs produits.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. Comptes utilisateur
          </h2>
          <p className="text-gray-700 mb-4">
            Vous êtes responsable de maintenir la confidentialité de vos
            identifiants de connexion et de toutes les activités qui se
            produisent sous votre compte.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. Comportement des utilisateurs
          </h2>
          <p className="text-gray-700 mb-4">
            Vous acceptez de ne pas :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Violer les lois applicables</li>
            <li>Harceler ou menacer d'autres utilisateurs</li>
            <li>Télécharger du contenu illégal ou offensant</li>
            <li>Contourner les mesures de sécurité</li>
            <li>Utiliser la plateforme à des fins commerciales non autorisées</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Produits numériques
          </h2>
          <p className="text-gray-700 mb-4">
            Les produits numériques sont des biens non physiques. Une fois
            téléchargés, ils ne peuvent généralement pas être remboursés. Vous
            acceptez les conditions de licence de chaque produit avant l'achat.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. Paiements et remboursements
          </h2>
          <p className="text-gray-700 mb-4">
            Les paiements sont traités via Stripe. Les remboursements sont
            traités selon notre politique de remboursement. Les produits
            numériques téléchargés ne sont généralement pas remboursables.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. Limitation de responsabilité
          </h2>
          <p className="text-gray-700 mb-4">
            VINA n'est pas responsable des dommages indirects, accidentels
            ou consécutifs résultant de l'utilisation de notre plateforme.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. Modification des conditions
          </h2>
          <p className="text-gray-700 mb-4">
            VINA se réserve le droit de modifier ces conditions à tout
            moment. Les modifications seront effectives dès leur publication.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. Contact
          </h2>
          <p className="text-gray-700 mb-4">
            Pour toute question concernant ces conditions, veuillez nous
            contacter à support@vina.tn.
          </p>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            En continuant à utiliser VINA, vous reconnaissez avoir lu,
            compris et accepté ces conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
