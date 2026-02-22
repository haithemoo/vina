import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { UploadButton } from "../components/UploadButton";

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "siteName", label: "Nom du site" },
  { key: "contactEmail", label: "Email de contact", type: "email" },
  { key: "phone1", label: "Téléphone 1" },
  { key: "phone2", label: "Téléphone 2" },
  { key: "phone3", label: "Téléphone 3" },
  { key: "facebookUrl", label: "Lien Facebook" },
  { key: "instagramUrl", label: "Lien Instagram" },
  { key: "twitterUrl", label: "Lien Twitter / X" },
];

export default function SettingsAdmin() {
  const [form, setForm] = useState<Record<string, string>>({
    siteName: "VINA",
    contactEmail: "contact@vina.tn",
    notifyOnNewOrder: "1",
  });

  const getQuery = trpc.admin.settings.get.useQuery();
  const updateMutation = trpc.admin.settings.update.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (getQuery.data && typeof getQuery.data === "object") {
      setForm((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(getQuery.data as Record<string, string>)) {
          if (v !== undefined && v !== null) next[k] = String(v);
        }
        return next;
      });
    }
  }, [getQuery.data]);

  const save = async () => {
    try {
      await updateMutation.mutateAsync(form);
      await utils.admin.settings.get.invalidate();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l’enregistrement.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>
      <p className="text-sm text-gray-500 mb-4">Nom du site, téléphones, réseaux sociaux et options. Les modifications sont visibles sur le site.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations du site</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, type = "text" }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8c8070] focus:border-transparent"
                  placeholder={type === "email" ? "contact@vina.tn" : ""}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Logo du site (optionnel)</h2>
          <div className="flex items-center gap-4">
            {form.siteLogo && (
              <img src={form.siteLogo} alt="Logo" className="h-16 object-contain rounded" />
            )}
            <UploadButton
              folder="settings"
              onUpload={(url) => setForm((f) => ({ ...f, siteLogo: url }))}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Choisir une image
            </UploadButton>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.notifyOnNewOrder === "1"}
              onChange={(e) => setForm((f) => ({ ...f, notifyOnNewOrder: e.target.checked ? "1" : "0" }))}
              className="w-4 h-4 rounded border-gray-300 text-[#8c8070] focus:ring-[#8c8070]"
            />
            <span>Recevoir un email à chaque nouvelle commande</span>
          </label>
        </div>
        <button
          onClick={save}
          disabled={updateMutation.isPending}
          className="bg-[#8c8070] text-white px-6 py-2 rounded-lg hover:bg-[#6d6458] disabled:opacity-50"
        >
          {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
