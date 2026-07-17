
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  ClipboardCopy,
  Languages,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../../../lib/api.js";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminEmptyState from "../../components/AdminEmptyState.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";

const statusOptions = [
  "all",
  "missing",
  "partial",
  "complete",
];

const longFields =
  new Set([
    "description",
    "content",
    "excerpt",
    "address",
    "openingHours",
    "note",
  ]);

const fieldNames = {
  name: {
    en: "Name",
    vi: "Tên",
  },
  tagline: {
    en: "Tagline",
    vi: "Thông điệp ngắn",
  },
  title: {
    en: "Title",
    vi: "Tiêu đề",
  },
  description: {
    en: "Description",
    vi: "Mô tả",
  },
  category: {
    en: "Category label",
    vi: "Tên danh mục",
  },
  group: {
    en: "Group",
    vi: "Nhóm",
  },
  excerpt: {
    en: "Excerpt",
    vi: "Mô tả ngắn",
  },
  content: {
    en: "Content",
    vi: "Nội dung",
  },
  discountText: {
    en: "Discount label",
    vi: "Nhãn ưu đãi",
  },
  linkLabel: {
    en: "Action label",
    vi: "Nhãn hành động",
  },
  address: {
    en: "Address",
    vi: "Địa chỉ",
  },
  openingHours: {
    en: "Opening-hours note",
    vi: "Ghi chú giờ hoạt động",
  },
  note: {
    en: "Note",
    vi: "Ghi chú",
  },
};

export default function TranslationsManager({
  refreshToken,
}) {
  const {
    language,
  } = useI18n();

  const vi =
    language === "vi";

  const toast =
    useToast();

  const [summary, setSummary] =
    useState({
      resources: [],
      totals: {
        total: 0,
        complete: 0,
        incomplete: 0,
        translatedFields: 0,
        expectedFields: 0,
        completion: 0,
      },
    });

  const [resource, setResource] =
    useState("");

  const [resourceMeta, setResourceMeta] =
    useState(null);

  const [items, setItems] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [form, setForm] =
    useState({});

  const [query, setQuery] =
    useState("");

  const deferredQuery =
    useDeferredValue(
      query
    );

  const [status, setStatus] =
    useState("all");

  const [loadingSummary, setLoadingSummary] =
    useState(true);

  const [loadingItems, setLoadingItems] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [bulkWorking, setBulkWorking] =
    useState(false);

  const [dirty, setDirty] =
    useState(false);

  const copy = vi
    ? {
        eyebrow:
          "Nội dung song ngữ",
        title:
          "translations.",
        description:
          "Quản lý bản gốc tiếng Anh và bản dịch tiếng Việt theo từng nhóm nội dung, phát hiện trường còn thiếu và kiểm tra fallback.",
        refresh:
          "Làm mới",
        total:
          "Tổng nội dung",
        complete:
          "Hoàn thành",
        incomplete:
          "Chưa hoàn thành",
        fieldProgress:
          "Tiến độ trường dịch",
        search:
          "Tìm nội dung",
        placeholder:
          "Tên, tiêu đề hoặc nội dung...",
        all:
          "Tất cả",
        missing:
          "Chưa dịch",
        partial:
          "Dịch một phần",
        completed:
          "Hoàn thành",
        items:
          "nội dung",
        select:
          "Chọn nội dung để dịch",
        selectBody:
          "Chọn một mục ở danh sách bên trái để xem bản gốc và chỉnh bản dịch.",
        source:
          "Bản gốc tiếng Anh",
        vietnamese:
          "Bản dịch tiếng Việt",
        fallback:
          "Nội dung fallback ngoài client",
        fallbackHelp:
          "Khi bản dịch để trống, client sẽ hiển thị bản gốc tiếng Anh.",
        copySource:
          "Sao chép bản gốc",
        save:
          "Lưu bản dịch",
        saving:
          "Đang lưu...",
        saved:
          "Đã lưu bản dịch.",
        nextIncomplete:
          "Mục chưa hoàn thành tiếp theo",
        previous:
          "Mục trước",
        next:
          "Mục sau",
        unsaved:
          "Bạn đang có thay đổi chưa lưu. Bỏ thay đổi và chuyển mục?",
        bulkCopy:
          "Điền bản gốc vào trường trống",
        bulkWarning:
          "Đây chỉ là placeholder, không phải bản dịch thực tế.",
        bulkDone:
          "Đã điền bản gốc vào các trường trống.",
        noItems:
          "Không tìm thấy nội dung phù hợp.",
        noItemsBody:
          "Thử nhóm nội dung, bộ lọc hoặc từ khóa khác.",
        noResources:
          "Không tìm thấy model có hỗ trợ chuyển ngữ.",
        originalEmpty:
          "Bản gốc đang trống",
        characters:
          "ký tự",
        status:
          "Trạng thái",
        resource:
          "Nhóm nội dung",
        internalNote:
          "Employees và Work schedule là dữ liệu vận hành nội bộ. Giao diện của các module này đã được dịch bằng hệ thống i18n, không nằm trong nội dung client cần dịch tại đây.",
      }
    : {
        eyebrow:
          "Bilingual content",
        title:
          "translations.",
        description:
          "Manage English source content and Vietnamese translations by resource, detect missing fields and review fallback behavior.",
        refresh:
          "Refresh",
        total:
          "Total content",
        complete:
          "Complete",
        incomplete:
          "Incomplete",
        fieldProgress:
          "Translated fields",
        search:
          "Search content",
        placeholder:
          "Name, title or content...",
        all:
          "All",
        missing:
          "Missing",
        partial:
          "Partial",
        completed:
          "Complete",
        items:
          "items",
        select:
          "Select content to translate",
        selectBody:
          "Choose an item from the list to review the source and edit its Vietnamese translation.",
        source:
          "English source",
        vietnamese:
          "Vietnamese translation",
        fallback:
          "Client fallback content",
        fallbackHelp:
          "When a translation is empty, the client displays the English source.",
        copySource:
          "Copy source",
        save:
          "Save translation",
        saving:
          "Saving...",
        saved:
          "Translation saved.",
        nextIncomplete:
          "Next incomplete item",
        previous:
          "Previous item",
        next:
          "Next item",
        unsaved:
          "You have unsaved changes. Discard them and switch items?",
        bulkCopy:
          "Fill empty fields from source",
        bulkWarning:
          "This creates placeholders, not real translations.",
        bulkDone:
          "Empty fields filled from source.",
        noItems:
          "No matching content.",
        noItemsBody:
          "Try another resource, filter or search.",
        noResources:
          "No translation-enabled models were found.",
        originalEmpty:
          "Source is empty",
        characters:
          "characters",
        status:
          "Status",
        resource:
          "Content group",
        internalNote:
          "Employees and Work schedule are internal operations. Their interface is translated by the i18n system and is not client content managed here.",
      };

  const selected =
    useMemo(
      () =>
        items.find(
          (item) =>
            item.id ===
            selectedId
        ) || null,
      [
        items,
        selectedId,
      ]
    );

  const selectedIndex =
    useMemo(
      () =>
        items.findIndex(
          (item) =>
            item.id ===
            selectedId
        ),
      [
        items,
        selectedId,
      ]
    );

  useEffect(() => {
    loadSummary();
  }, [refreshToken]);

  useEffect(() => {
    if (!resource) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          loadItems();
        },
        260
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    resource,
    status,
    deferredQuery,
    refreshToken,
  ]);

  useEffect(() => {
    if (!selected) {
      setForm({});
      setDirty(false);
      return;
    }

    setForm({
      ...selected.translation,
    });

    setDirty(false);
  }, [
    selectedId,
    selected?.updatedAt,
  ]);

  async function requestWithRetry(
    path,
    options
  ) {
    try {
      return await api.request(
        path,
        options
      );
    } catch (error) {
      const method =
        String(
          options?.method ||
            "GET"
        ).toUpperCase();

      if (
        method !== "GET"
      ) {
        throw error;
      }

      await wait(500);

      return api.request(
        path,
        options
      );
    }
  }

  async function loadSummary() {
    try {
      setLoadingSummary(true);

      const data =
        await requestWithRetry(
          `/translations-admin/summary?t=${Date.now()}`
        );

      setSummary(data);

      const available =
        data.resources || [];

      if (
        !resource &&
        available.length
      ) {
        setResource(
          available[0].id
        );
      } else if (
        resource &&
        !available.some(
          (item) =>
            item.id ===
            resource
        )
      ) {
        setResource(
          available[0]
            ?.id || ""
        );
      }
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  async function loadItems() {
    try {
      setLoadingItems(true);

      const params =
        new URLSearchParams({
          status,
          q:
            deferredQuery.trim(),
          t:
            String(
              Date.now()
            ),
        });

      const data =
        await requestWithRetry(
          `/translations-admin/${resource}?${params.toString()}`
        );

      setItems(
        data.items || []
      );

      setResourceMeta(
        data.resource ||
          null
      );

      if (
        selectedId &&
        !(data.items || []).some(
          (item) =>
            item.id ===
            selectedId
        )
      ) {
        setSelectedId("");
      }
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setLoadingItems(false);
    }
  }

  function chooseItem(
    item
  ) {
    if (
      dirty &&
      !window.confirm(
        copy.unsaved
      )
    ) {
      return;
    }

    setSelectedId(
      item.id
    );
  }

  function updateField(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]:
          value,
      })
    );

    setDirty(true);
  }

  function copyField(
    key
  ) {
    updateField(
      key,
      selected?.source?.[
        key
      ] || ""
    );
  }

  async function save() {
    if (!selected) {
      return;
    }

    try {
      setSaving(true);

      const data =
        await api.request(
          `/translations-admin/${resource}/${selected.id}`,
          {
            method:
              "PATCH",
            body:
              JSON.stringify({
                translation:
                  form,
              }),
          }
        );

      setItems(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              data.item.id
                ? data.item
                : item
          )
      );

      setForm({
        ...data.item
          .translation,
      });

      setDirty(false);

      toast.show(
        copy.saved
      );

      await loadSummary();
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function bulkCopySource() {
    const targets =
      items.filter(
        (item) =>
          item.status !==
          "complete"
      );

    if (!targets.length) {
      return;
    }

    const accepted =
      window.confirm(
        `${copy.bulkCopy}\n\n${copy.bulkWarning}`
      );

    if (!accepted) {
      return;
    }

    try {
      setBulkWorking(true);

      await api.request(
        `/translations-admin/${resource}/copy-source`,
        {
          method:
            "POST",
          body:
            JSON.stringify({
              ids:
                targets.map(
                  (item) =>
                    item.id
                ),
            }),
        }
      );

      toast.show(
        copy.bulkDone
      );

      await Promise.all([
        loadItems(),
        loadSummary(),
      ]);
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setBulkWorking(false);
    }
  }

  function moveSelection(
    offset
  ) {
    if (!items.length) {
      return;
    }

    const nextIndex =
      selectedIndex < 0
        ? 0
        : Math.min(
            items.length -
              1,
            Math.max(
              0,
              selectedIndex +
                offset
            )
          );

    chooseItem(
      items[nextIndex]
    );
  }

  function selectNextIncomplete() {
    if (!items.length) {
      return;
    }

    const start =
      selectedIndex < 0
        ? 0
        : selectedIndex +
          1;

    const ordered = [
      ...items.slice(
        start
      ),
      ...items.slice(
        0,
        start
      ),
    ];

    const next =
      ordered.find(
        (item) =>
          item.status !==
          "complete"
      );

    if (next) {
      chooseItem(next);
    }
  }

  const currentResourceSummary =
    summary.resources.find(
      (item) =>
        item.id ===
        resource
    );

  return (
    <div
      data-admin-responsive-page="TranslationsManager"
      data-no-auto-translate
    >
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={
          copy.description
        }
        actions={
          <button
            type="button"
            className="admin-button-secondary"
            onClick={() =>
              Promise.all([
                loadSummary(),
                loadItems(),
              ])
            }
            disabled={
              loadingSummary ||
              loadingItems
            }
          >
            <RefreshCw
              size={16}
              className={
                loadingSummary ||
                loadingItems
                  ? "animate-spin"
                  : ""
              }
            />
            {copy.refresh}
          </button>
        }
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            Languages
          }
          label={
            copy.total
          }
          value={
            loadingSummary
              ? "—"
              : summary.totals
                  .total
          }
          note={`${summary.resources.length} ${copy.resource.toLowerCase()}`}
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          label={
            copy.complete
          }
          value={
            loadingSummary
              ? "—"
              : summary.totals
                  .complete
          }
          note={`${summary.totals.completion}%`}
          success
        />

        <SummaryCard
          icon={
            AlertTriangle
          }
          label={
            copy.incomplete
          }
          value={
            loadingSummary
              ? "—"
              : summary.totals
                  .incomplete
          }
          note={`${Math.max(
            0,
            100 -
              summary.totals
                .completion
          )}%`}
          warning
        />

        <SummaryCard
          icon={
            Sparkles
          }
          label={
            copy.fieldProgress
          }
          value={`${summary.totals.translatedFields}/${summary.totals.expectedFields}`}
          note={`${summary.totals.completion}%`}
        />
      </section>

      <section className="admin-card mb-6 p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="admin-label">
              {copy.resource}
            </p>

            <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
              {summary.resources.map(
                (item) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() => {
                      if (
                        dirty &&
                        !window.confirm(
                          copy.unsaved
                        )
                      ) {
                        return;
                      }

                      setResource(
                        item.id
                      );

                      setSelectedId(
                        ""
                      );
                    }}
                    className={[
                      "min-h-12 shrink-0 rounded-full border px-4 text-left transition",
                      resource ===
                      item.id
                        ? "border-trap-blue bg-trap-blue text-white"
                        : "border-trap-blue/12 bg-white text-trap-blue",
                    ].join(
                      " "
                    )}
                  >
                    <span className="block text-[9px] font-extrabold uppercase tracking-[0.1em]">
                      {item.label}
                    </span>

                    <span
                      className={[
                        "mt-1 block text-[8px] font-bold uppercase tracking-[0.08em]",
                        resource ===
                        item.id
                          ? "text-trap-yellow"
                          : "text-trap-ink/40",
                      ].join(
                        " "
                      )}
                    >
                      {
                        item.complete
                      }
                      /
                      {
                        item.total
                      }{" "}
                      ·{" "}
                      {
                        item.completion
                      }
                      %
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            className="admin-button-secondary"
            onClick={
              bulkCopySource
            }
            disabled={
              bulkWorking ||
              !items.some(
                (item) =>
                  item.status !==
                  "complete"
              )
            }
          >
            {bulkWorking ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <ClipboardCopy
                size={16}
              />
            )}

            {copy.bulkCopy}
          </button>
        </div>

        <div className="mt-5 grid gap-4 border-t border-trap-blue/10 pt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="relative block">
            <span className="admin-label">
              {copy.search}
            </span>

            <Search
              size={17}
              className="admin-search-icon pointer-events-none absolute"
            />

            <input
              className="admin-input admin-search-control"
              value={query}
              placeholder={
                copy.placeholder
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
            />
          </label>

          <div className="admin-scrollbar flex gap-2 overflow-x-auto pb-1">
            {statusOptions.map(
              (value) => {
                const labels = {
                  all:
                    copy.all,
                  missing:
                    copy.missing,
                  partial:
                    copy.partial,
                  complete:
                    copy.completed,
                };

                return (
                  <button
                    key={
                      value
                    }
                    type="button"
                    onClick={() =>
                      setStatus(
                        value
                      )
                    }
                    className={[
                      "min-h-11 shrink-0 rounded-full border px-4 text-[9px] font-extrabold uppercase tracking-[0.1em]",
                      status ===
                      value
                        ? "border-trap-blue bg-trap-blue text-trap-yellow"
                        : "border-trap-blue/12 bg-white text-trap-blue",
                    ].join(
                      " "
                    )}
                  >
                    {
                      labels[
                        value
                      ]
                    }
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-trap-yellow/55 bg-[#fffbea] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-trap-orange"
            />

            <p className="text-xs font-semibold leading-5 text-trap-ink/58">
              {
                copy.internalNote
              }
            </p>
          </div>
        </div>
      </section>

      {!summary.resources.length &&
      !loadingSummary ? (
        <AdminEmptyState
          title={
            copy.noResources
          }
          description={
            copy.description
          }
        />
      ) : (
        <section className="grid gap-6 2xl:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.5fr)]">
          <aside className="admin-card overflow-hidden 2xl:sticky 2xl:top-24 2xl:max-h-[calc(var(--admin-viewport-height)-7rem)]">
            <div className="flex items-center justify-between gap-3 border-b border-trap-blue/10 bg-[#f8f9fd] p-4">
              <div>
                <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-trap-orange">
                  {
                    resourceMeta?.label ||
                    currentResourceSummary
                      ?.label ||
                    copy.resource
                  }
                </p>

                <p className="mt-1 text-sm font-extrabold text-trap-blue">
                  {
                    items.length
                  }{" "}
                  {
                    copy.items
                  }
                </p>
              </div>

              <ProgressRing
                value={
                  currentResourceSummary
                    ?.completion ||
                  0
                }
              />
            </div>

            <div className="admin-scrollbar max-h-[42rem] overflow-y-auto p-3 2xl:max-h-[calc(var(--admin-viewport-height)-12rem)]">
              {loadingItems ? (
                <div className="grid min-h-64 place-items-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-trap-blue"
                  />
                </div>
              ) : items.length ? (
                <div className="grid gap-2">
                  {items.map(
                    (item) => (
                      <TranslationListItem
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        selected={
                          item.id ===
                          selectedId
                        }
                        onClick={() =>
                          chooseItem(
                            item
                          )
                        }
                        copy={
                          copy
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="p-5 text-center">
                  <CircleDashed
                    size={28}
                    className="mx-auto text-trap-blue/35"
                  />

                  <p className="mt-4 text-sm font-extrabold text-trap-blue">
                    {
                      copy.noItems
                    }
                  </p>

                  <p className="mt-2 text-xs font-medium leading-5 text-trap-ink/45">
                    {
                      copy.noItemsBody
                    }
                  </p>
                </div>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            {selected ? (
              <article className="admin-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-trap-blue/10 bg-[#f8f9fd] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={
                          selected.status
                        }
                        copy={
                          copy
                        }
                      />

                      <span className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/36">
                        {
                          selected.translatedFields
                        }
                        /
                        {
                          selected.expectedFields
                        }{" "}
                        ·{" "}
                        {
                          selected.completion
                        }
                        %
                      </span>
                    </div>

                    <h2 className="mt-3 break-words text-xl font-extrabold text-trap-blue">
                      {
                        selected.title
                      }
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() =>
                        moveSelection(
                          -1
                        )
                      }
                      disabled={
                        selectedIndex <=
                        0
                      }
                      aria-label={
                        copy.previous
                      }
                    >
                      <ChevronLeft
                        size={17}
                      />
                    </button>

                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() =>
                        moveSelection(
                          1
                        )
                      }
                      disabled={
                        selectedIndex <
                          0 ||
                        selectedIndex >=
                          items.length -
                            1
                      }
                      aria-label={
                        copy.next
                      }
                    >
                      <ChevronRight
                        size={17}
                      />
                    </button>

                    <button
                      type="button"
                      className="admin-button-secondary"
                      onClick={
                        selectNextIncomplete
                      }
                    >
                      {
                        copy.nextIncomplete
                      }
                      <ArrowRight
                        size={15}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 p-5">
                  {(resourceMeta
                    ?.fields ||
                    []).map(
                    (field) => (
                      <TranslationField
                        key={
                          field.key
                        }
                        field={
                          field
                        }
                        source={
                          selected
                            .source?.[
                            field.key
                          ] || ""
                        }
                        value={
                          form[
                            field.key
                          ] || ""
                        }
                        language={
                          language
                        }
                        copy={
                          copy
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            field.key,
                            value
                          )
                        }
                        onCopy={() =>
                          copyField(
                            field.key
                          )
                        }
                      />
                    )
                  )}
                </div>

                <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-trap-blue/10 bg-white/94 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-trap-ink/42">
                    {dirty
                      ? vi
                        ? "Có thay đổi chưa lưu."
                        : "Unsaved changes."
                      : vi
                        ? "Nội dung đã đồng bộ."
                        : "Content is synchronized."}
                  </p>

                  <button
                    type="button"
                    className="admin-button-primary"
                    onClick={
                      save
                    }
                    disabled={
                      saving ||
                      !dirty
                    }
                  >
                    {saving ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={16}
                      />
                    )}

                    {saving
                      ? copy.saving
                      : copy.save}
                  </button>
                </div>
              </article>
            ) : (
              <AdminEmptyState
                title={
                  copy.select
                }
                description={
                  copy.selectBody
                }
                action={
                  items[0] ? (
                    <button
                      type="button"
                      className="admin-button-primary"
                      onClick={() =>
                        chooseItem(
                          items[0]
                        )
                      }
                    >
                      {
                        copy.select
                      }
                      <ArrowRight
                        size={15}
                      />
                    </button>
                  ) : null
                }
              />
            )}
          </main>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
  success = false,
  warning = false,
}) {
  return (
    <article className="admin-card-flat p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-trap-ink/42">
            {label}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-trap-blue">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-trap-ink/42">
            {note}
          </p>
        </div>

        <span
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
            success
              ? "bg-emerald-100 text-emerald-700"
              : warning
                ? "bg-orange-100 text-orange-700"
                : "bg-[#eef1ff] text-trap-blue",
          ].join(
            " "
          )}
        >
          <Icon
            size={19}
          />
        </span>
      </div>
    </article>
  );
}

function TranslationListItem({
  item,
  selected,
  onClick,
  copy,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        selected
          ? "border-trap-blue bg-[#eef1ff] shadow-[0_12px_26px_rgb(1_30_160_/_10%)]"
          : "border-trap-blue/8 bg-white hover:border-trap-blue/25",
      ].join(
        " "
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <b className="block break-words text-sm leading-5 text-trap-blue">
            {
              item.title
            }
          </b>

          <small className="mt-2 block text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/35">
            {
              item.translatedFields
            }
            /
            {
              item.expectedFields
            }{" "}
            ·{" "}
            {
              item.completion
            }
            %
          </small>
        </span>

        <StatusDot
          status={
            item.status
          }
        />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={[
            "h-full rounded-full",
            item.status ===
            "complete"
              ? "bg-emerald-500"
              : item.status ===
                  "partial"
                ? "bg-trap-yellow"
                : "bg-orange-400",
          ].join(
            " "
          )}
          style={{
            width: `${item.completion}%`,
          }}
        />
      </div>
    </button>
  );
}

function TranslationField({
  field,
  source,
  value,
  language,
  copy,
  onChange,
  onCopy,
}) {
  const label =
    fieldNames[
      field.key
    ]?.[
      language
    ] ||
    field.label;

  const fallback =
    value.trim() ||
    source;

  const multiline =
    field.long ||
    longFields.has(
      field.key
    );

  return (
    <section className="overflow-hidden rounded-2xl border border-trap-blue/10">
      <div className="flex flex-col gap-3 border-b border-trap-blue/10 bg-[#f8f9fd] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-trap-blue">
            {label}
          </p>

          <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/35">
            {
              value.length
            }{" "}
            {
              copy.characters
            }
          </p>
        </div>

        <button
          type="button"
          className="admin-button-secondary"
          onClick={
            onCopy
          }
          disabled={
            !source
          }
        >
          <ClipboardCopy
            size={14}
          />
          {
            copy.copySource
          }
        </button>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-trap-blue/10 p-4 lg:border-b-0 lg:border-r">
          <p className="admin-label">
            {
              copy.source
            }
          </p>

          <div className="min-h-24 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm font-medium leading-6 text-trap-ink/65">
            {source ||
              copy.originalEmpty}
          </div>
        </div>

        <label className="p-4">
          <span className="admin-label">
            {
              copy.vietnamese
            }
          </span>

          {multiline ? (
            <textarea
              className="admin-textarea min-h-32"
              value={
                value
              }
              onChange={(
                event
              ) =>
                onChange(
                  event.target
                    .value
                )
              }
            />
          ) : (
            <input
              className="admin-input"
              value={
                value
              }
              onChange={(
                event
              ) =>
                onChange(
                  event.target
                    .value
                )
              }
            />
          )}
        </label>
      </div>

      <div className="border-t border-trap-blue/10 bg-[#fffbea] p-4">
        <div className="flex items-start gap-3">
          {value.trim() ? (
            <Check
              size={16}
              className="mt-1 shrink-0 text-emerald-600"
            />
          ) : (
            <AlertTriangle
              size={16}
              className="mt-1 shrink-0 text-trap-orange"
            />
          )}

          <div className="min-w-0">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-trap-blue">
              {
                copy.fallback
              }
            </p>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-trap-ink/58">
              {fallback ||
                copy.originalEmpty}
            </p>

            {!value.trim() && (
              <p className="mt-2 text-xs font-semibold text-trap-orange">
                {
                  copy.fallbackHelp
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({
  status,
  copy,
}) {
  const config = {
    complete: {
      label:
        copy.completed,
      className:
        "bg-emerald-100 text-emerald-800",
    },
    partial: {
      label:
        copy.partial,
      className:
        "bg-yellow-100 text-yellow-800",
    },
    missing: {
      label:
        copy.missing,
      className:
        "bg-orange-100 text-orange-800",
    },
  }[status];

  return (
    <span
      className={[
        "admin-badge",
        config.className,
      ].join(
        " "
      )}
    >
      {
        config.label
      }
    </span>
  );
}

function StatusDot({
  status,
}) {
  return (
    <span
      className={[
        "mt-1 h-3 w-3 shrink-0 rounded-full",
        status ===
        "complete"
          ? "bg-emerald-500"
          : status ===
              "partial"
            ? "bg-trap-yellow"
            : "bg-orange-400",
      ].join(
        " "
      )}
    />
  );
}

function ProgressRing({
  value,
}) {
  const safeValue =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          value || 0
        )
      )
    );

  return (
    <span
      className="grid h-12 w-12 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#011ea0 ${safeValue * 3.6}deg, #e8ebf5 0deg)`,
      }}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[8px] font-extrabold text-trap-blue">
        {
          safeValue
        }
        %
      </span>
    </span>
  );
}

function wait(
  milliseconds
) {
  return new Promise(
    (resolve) =>
      window.setTimeout(
        resolve,
        milliseconds
      )
  );
}
