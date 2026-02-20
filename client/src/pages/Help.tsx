import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, HelpCircle, Mail } from "lucide-react";

export default function Help() {
  const faqs = [
    {
      question: "Comment télécharger mes produits après l'achat ?",
      answer:
        "Une fois votre paiement confirmé, vous recevrez un lien de téléchargement par e-mail. Vous pouvez également accéder à vos téléchargements depuis votre page de commandes.",
    },
    {
      question: "Puis-je utiliser les produits commercialement ?",
      answer:
        "Cela dépend de la licence du produit. Vérifiez les conditions d'utilisation spécifiques du produit avant de l'utiliser commercialement.",
    },
    {
      question: "Comment devenir créateur ?",
      answer:
        "Connectez-vous à votre compte et accédez à votre tableau de bord. Cliquez sur 'Devenir créateur' pour configurer votre profil et commencer à vendre.",
    },
    {
      question: "Quels formats de fichiers sont acceptés ?",
      answer:
        "Nous acceptons tous les formats numériques courants : PNG, JPG, PSD, AI, SVG, ZIP, et bien d'autres. Vérifiez que votre fichier ne dépasse pas 100 MB.",
    },
    {
      question: "Comment puis-je obtenir un remboursement ?",
      answer:
        "Les produits numériques ne peuvent généralement pas être remboursés une fois téléchargés. Contactez notre support si vous avez des problèmes.",
    },
    {
      question: "Combien de temps faut-il pour que mon produit soit approuvé ?",
      answer:
        "Les produits sont généralement approuvés dans les 24 heures. Vous recevrez une notification par e-mail une fois approuvé.",
    },
  ];

  const contacts = [
    {
      icon: Mail,
      title: "E-mail",
      description: "support@vina.tn",
      action: "Envoyer un e-mail",
    },
    {
      icon: MessageCircle,
      title: "Chat en direct",
      description: "Disponible 24/7",
      action: "Ouvrir le chat",
    },
    {
      icon: HelpCircle,
      title: "Centre d'aide",
      description: "Consultez nos guides",
      action: "Voir les guides",
    },
  ];

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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Centre d'aide</h1>
        <p className="text-lg text-gray-600">
          Trouvez les réponses à vos questions
        </p>
      </div>

      <div className="container pb-12">
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <div
                key={i}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-gray-200"
              >
                <Icon className="w-8 h-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  {contact.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {contact.description}
                </p>
                <Button variant="outline" size="sm">
                  {contact.action}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="section-title">Questions fréquemment posées</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              >
                <summary className="font-semibold text-gray-900">
                  {faq.question}
                </summary>
                <p className="text-gray-600 mt-3">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Besoin d'aide supplémentaire ?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Notre équipe de support est prête à vous aider. N'hésitez pas à nous
            contacter pour toute question ou problème.
          </p>
          <Button className="btn-primary">Contacter le support</Button>
        </div>
      </div>
    </div>
  );
}
