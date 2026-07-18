import {
  Globe2,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Store,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api.js";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import OpeningHoursEditor from "../../components/OpeningHoursEditor.jsx";
import GoogleMapsEmbedEditor from "../../components/GoogleMapsEmbedEditor.jsx";
import "../../styles/store-settings-refined-v4.css";
import HomepageMediaEditor from "../../components/HomepageMediaEditor.jsx";
import AdminPasswordCard from "../../components/AdminPasswordCard.jsx";
import "../../styles/store-settings-layout-v8.css";
import "../../styles/store-media-actions-v9.css";

const objectPositions = [
  ["center center", "Center"],
  ["center top", "Top center"],
  ["center bottom", "Bottom center"],
  ["left center", "Left center"],
  ["right center", "Right center"],
  ["left top", "Top left"],
  ["right top", "Top right"],
  ["left bottom", "Bottom left"],
  ["right bottom", "Bottom right"],
];

const sections = [
  {
    title: "Brand identity",
    description: "Public copy used throughout the client website.",
    fields: [
      { name: "name", label: "Store name", required: true },
      { name: "tagline", label: "Tagline" },
      {
        name: "description",
        label: "Short description",
        type: "textarea",
        full: true,
      },
      {
        name: "note",
        label: "Brand story / public note",
        type: "textarea",
        full: true,
      },
    ],
  },
  {
    title: "Contact and location",
    description: "Information customers use to contact and visit the store.",
    fields: [
      { name: "phone", label: "Phone number", inputMode: "tel" },
            {
        name: "address",
        label: "Address",
        type: "textarea",
        full: true,
      },
    ],
  },
  {
    title: "Social media",
    description: "Manage public social links. Google Maps is configured in the dedicated location section below.",
    fields: [
      {
        name: "instagramUrl",
        label: "Instagram URL",
        type: "url",
        placeholder: "https://www.instagram.com/trapart.room/",
        full: true,
      },
    ],
  },
];

function normalizeHeroImages(value = [], storeName = "TRAP Room") {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const url = String(item?.url || item?.secureUrl || "").trim();
      if (!url) return null;

      return {
        ...item,
        url,
        resourceType: item.resourceType || "image",
        alt: item.alt || `${storeName} hero ${index + 1}`,
        objectPosition: item.objectPosition || "center center",
        sortOrder: index + 1,
      };
    })
    .filter(Boolean);
}

export default function ShopManager({ refreshToken }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const toast = useToast();

  async function load() {
    try {
      setLoading(true);
      const data = await api.getShop();
      const shop = data.shop || {};

      setForm({
        ...shop,
        heroImages: normalizeHeroImages(shop.heroImages, shop.name),
      });
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshToken]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateHeroes(next) {
    setForm((current) => ({
      ...current,
      heroImages: normalizeHeroImages(next, current.name),
    }));
  }

  async function upload(field, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    try {
      setUploading(field);
      const data = await api.upload(files);
      const media = Array.isArray(data.media) ? data.media : [];

      if (!media.length) {
        throw new Error("Cloudinary did not return uploaded media.");
      }

      if (field === "heroImages") {
        updateHeroes([
          ...(form.heroImages || []),
          ...media.map((item, index) => ({
            ...item,
            alt: `${form.name || "TRAP Room"} hero ${(form.heroImages?.length || 0) + index + 1}`,
            objectPosition: "center center",
          })),
        ]);
      } else {
        update(field, media[0].url);
      }

      toast.show("Upload completed.");
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setUploading("");
    }
  }

  function moveHero(index, direction) {
    const target = index + direction;
    const current = [...(form.heroImages || [])];

    if (target < 0 || target >= current.length) return;

    [current[index], current[target]] = [current[target], current[index]];
    updateHeroes(current);
  }

  function updateHero(index, field, value) {
    updateHeroes(
      (form.heroImages || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeHero(index) {
    updateHeroes(
      (form.heroImages || []).filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function submit(event) {
    event.preventDefault();

    if (!String(form.name || "").trim()) {
      toast.show("Store name is required.", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        name: String(form.name || "").trim(),
        heroImages: normalizeHeroImages(form.heroImages, form.name),
      };

      const data = await api.updateShop(payload);
      setForm({
        ...data.shop,
        heroImages: normalizeHeroImages(data.shop?.heroImages, data.shop?.name),
      });
      toast.show("Store settings saved and client refresh requested.");
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const previewImage = useMemo(
    () => form.heroImages?.[0]?.url || form.coverImageUrl || "",
    [form.heroImages, form.coverImageUrl]
  );

  return (
    <form data-store-settings-page="true"
      data-store-settings-v8="true" className="store-settings-page" onSubmit={submit}>
      <AdminPageHeader
        eyebrow="Store profile"
        title="store settings."
        description="Manage public information, brand media, homepage hero order and Google Maps."
        actions={
          <>
            <button
              type="button"
              className="admin-button-secondary"
              onClick={load}
              disabled={loading || saving}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Reload
            </button>

            <button
              type="submit"
              className="admin-button-primary"
              disabled={saving || loading || Boolean(uploading)}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </>
        }
      />

      {loading ? (
        <div data-admin-responsive-page="ShopManager" className="admin-card grid min-h-80 place-items-center">
          <Loader2 className="animate-spin text-trap-blue" size={28} />
        </div>
      ) : (
        <div className="store-settings-layout grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="store-settings-main grid gap-6">
            {sections.map((section) => (
              <section key={section.title} data-store-section={section.title} className="admin-card p-5 sm:p-6">
                <SectionHeading title={section.title} description={section.description} />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                      <span className="admin-label">{field.label}</span>

                      {field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          className="admin-textarea"
                          value={form[field.name] || ""}
                          placeholder={field.placeholder}
                          required={field.required}
                          onChange={(event) => update(field.name, event.target.value)}
                        />
                      ) : (
                        <input
                          name={field.name}
                          className="admin-input"
                          type={field.type || "text"}
                          inputMode={field.inputMode}
                          value={form[field.name] || ""}
                          placeholder={field.placeholder}
                          required={field.required}
                          onChange={(event) => update(field.name, event.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            ))}

                      <div className="store-settings-location-stack">
          <div data-store-opening-hours="true" className="store-settings-module">
            <OpeningHoursEditor
                      value={form.openingHoursSchedule}
                      legacyValue={form.openingHours}
                      onChange={({ schedule, summary }) =>
                        setForm((current) => ({
                          ...current,
                          openingHoursSchedule: schedule,
                          openingHours: summary,
                        }))
                      }
                      onSaved={(shop) =>
                        setForm((current) => ({
                          ...current,
                          ...(shop || {}),
                        }))
                      }
                    />
          </div>
          <div data-store-google-map="true" className="store-settings-module">
            <GoogleMapsEmbedEditor
                        value={
                          form.googleMapsEmbedUrl ||
                          form.googleMapEmbedUrl ||
                          form.mapEmbedUrl ||
                          ""
                        }
                        directionsUrl={
                          form.googleMapsUrl ||
                          ""
                        }
                        address={
                          form.address ||
                          ""
                        }
                        onEmbedChange={(embedUrl) =>
                          setForm((current) => ({
                            ...current,
                            googleMapsEmbedUrl: embedUrl,
                            googleMapEmbedUrl: embedUrl,
                            mapEmbedUrl: embedUrl,
                          }))
                        }
                        onDirectionsChange={(directionsUrl) =>
                          setForm((current) => ({
                            ...current,
                            googleMapsUrl: directionsUrl,
                          }))
                        }
                      />
          </div>
          </div>

<section className="admin-card p-5 sm:p-6">
              <SectionHeading
                title="Logo and cover"
                description="Use optimized JPG, PNG or WEBP files. The first selected file is used."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div
                  data-favicon-picker="true"
                  className="grid gap-3"
                >
                  <UploadCard
                    title="Store logo"
                    value={form.logoUrl}
                    busy={uploading === "logoUrl"}
                    onFiles={(files) => upload("logoUrl", files)}
                  />

                  <button
                    type="button"
                    className={[
                      "flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-[9px] font-extrabold uppercase tracking-[0.12em] transition",
                      form.logoUrl &&
                      form.faviconUrl === form.logoUrl
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-trap-blue/15 bg-white text-trap-blue hover:bg-[#eef1ff]",
                    ].join(" ")}
                    disabled={!form.logoUrl}
                    onClick={() =>
                      update("faviconUrl", form.logoUrl)
                    }
                  >
                    {form.logoUrl &&
                    form.faviconUrl === form.logoUrl ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Globe2 size={16} />
                    )}

                    {form.logoUrl &&
                    form.faviconUrl === form.logoUrl
                      ? "Selected as browser icon"
                      : "Use logo as browser icon"}
                  </button>

                  <div className="flex items-center gap-3 rounded-2xl border border-trap-blue/10 bg-[#f8f9fd] p-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
                      <img
                        src={form.faviconUrl || "/favicon.svg"}
                        alt="Browser tab icon preview"
                        className="h-full w-full object-contain p-1.5"
                      />
                    </span>

                    <span className="min-w-0">
                      <b className="block text-xs text-trap-blue">
                        Browser tab preview
                      </b>

                      <small className="mt-1 block text-[10px] font-medium leading-4 text-trap-ink/45">
                        A square PNG, WEBP or SVG gives the clearest result. Save changes after selecting.
                      </small>
                    </span>
                  </div>

                  {form.faviconUrl ? (
                    <button
                      type="button"
                      className="justify-self-start text-[10px] font-extrabold uppercase tracking-[0.1em] text-trap-orange underline underline-offset-4"
                      onClick={() =>
                        update("faviconUrl", "")
                      }
                    >
                      Use default browser icon
                    </button>
                  ) : null}
                </div>

                <UploadCard
                  title="Cover image"
                  value={form.coverImageUrl}
                  busy={uploading === "coverImageUrl"}
                  onFiles={(files) => upload("coverImageUrl", files)}
                />
              </div>
            </section>
            <AdminPasswordCard />


            <div
          data-store-homepage-media
          className="w-full sm:col-span-2 lg:col-span-2 xl:col-span-2"
        >
          <HomepageMediaEditor
            form={form}
            setForm={setForm}
          />
        </div>
          </div>

          <aside className="store-settings-preview self-start">
            <div className="admin-card overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eef1ff]">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={form.heroImages?.[0]?.alt || "Store preview"}
                    style={{ objectPosition: form.heroImages?.[0]?.objectPosition || "center center" }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-trap-blue">
                    <ImagePlus size={42} />
                  </div>
                )}

                <span className="absolute left-4 top-4 admin-badge bg-white/90 text-trap-blue backdrop-blur">
                  Client preview
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff9d7] text-trap-blue">
                    <Store size={20} />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-extrabold text-trap-blue">
                      {form.name || "TRAP Room"}
                    </h3>
                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-trap-orange">
                      {form.tagline || "Coffee · Matcha · Homebaked"}
                    </p>
                  </div>
                </div>

                <p className="mt-5 line-clamp-5 text-sm font-medium leading-6 text-trap-ink/55">
                  {form.description || "Add a public store description."}
                </p>

                <div className="mt-5 rounded-xl bg-[#f5f7fb] p-4 text-xs font-medium leading-6 text-trap-ink/55">
                  <b className="flex items-center gap-2 text-trap-blue">
                    <MapPin size={15} /> Location
                  </b>
                  <span className="mt-1 block">{form.address || "No address added"}</span>
                </div>
              </div>
            </div>

            
          </aside>
        </div>
      )}
    
      


        
</form>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="border-b border-trap-blue/10 pb-5">
      <h3 className="text-lg font-extrabold text-trap-blue">{title}</h3>
      <p className="mt-1 text-xs font-medium leading-5 text-trap-ink/45">{description}</p>
    </div>
  );
}

function UploadCard({ title, value, busy, onFiles }) {
  return (
    <label className="cursor-pointer rounded-2xl border border-trap-blue/10 bg-[#f8f9fd] p-3">
      <div className="grid aspect-video place-items-center overflow-hidden rounded-xl bg-white">
        {value ? (
          <img src={value} alt={title} className="h-full w-full object-contain p-3" />
        ) : (
          <ImagePlus size={30} className="text-trap-blue/45" />
        )}
      </div>

      <span className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-full bg-trap-blue px-4 text-[9px] font-extrabold uppercase tracking-[0.12em] text-trap-yellow">
        {busy ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
        {title}
      </span>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}

function HeroMediaRow({ item, index, total, onMove, onUpdate, onRemove }) {
  return (
    <article className="admin-card-flat grid gap-4 p-3 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-start">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#eef1ff] lg:aspect-square">
        {item.resourceType === "video" ? (
          <video src={item.url} controls playsInline className="h-full w-full object-cover" />
        ) : (
          <img
            src={item.url}
            alt={item.alt || ""}
            style={{ objectPosition: item.objectPosition || "center center" }}
            className="h-full w-full object-cover"
          />
        )}

        <span className="absolute left-2 top-2 admin-badge bg-white/90 text-trap-blue">
          {index === 0 ? "Primary" : `Hero ${index + 1}`}
        </span>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="admin-label">Alternative text</span>
          <input
            className="admin-input"
            value={item.alt || ""}
            placeholder="Describe the image for accessibility"
            onChange={(event) => onUpdate(index, "alt", event.target.value)}
          />
        </label>

        <label>
          <span className="admin-label">Crop focus</span>
          <select
            className="admin-select"
            value={item.objectPosition || "center center"}
            onChange={(event) => onUpdate(index, "objectPosition", event.target.value)}
          >
            {objectPositions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="admin-label">Media URL</span>
          <input className="admin-input" value={item.url || ""} readOnly />
        </label>
      </div>

      <div className="flex gap-2 lg:flex-col">
        <button
          type="button"
          className="admin-icon-button"
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          aria-label="Move hero up"
        >
          <ArrowUp size={17} />
        </button>

        <button
          type="button"
          className="admin-icon-button"
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
          aria-label="Move hero down"
        >
          <ArrowDown size={17} />
        </button>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
          onClick={() => onRemove(index)}
          aria-label="Remove hero media"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
