
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../../../lib/api.js";
import { useI18n } from "../../../i18n/I18nProvider.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import AdminConfirmDialog from "../../components/AdminConfirmDialog.jsx";
import AdminEmptyState from "../../components/AdminEmptyState.jsx";
import AdminPageHeader from "../../components/AdminPageHeader.jsx";
import {
  PERMISSION_OPTIONS,
  ROLE_OPTIONS,
  ROLE_TEMPLATES,
} from "../../staffConfig.js";

const newEmployee = () => ({
  fullName: "",
  phone: "",
  email: "",
  position: "Barista",
  role: "barista",
  username: "",
  password: "",
  permissions: [...ROLE_TEMPLATES.barista],
  accountEnabled: true,
  isActive: true,
  mustChangePassword: true,
  hireDate: "",
  note: "",
});

export default function EmployeesManager({
  refreshToken,
}) {
  const { language } = useI18n();
  const vi = language === "vi";
  const toast = useToast();

  const [employees, setEmployees] =
    useState([]);
  const [query, setQuery] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [form, setForm] =
    useState(newEmployee);
  const [editingId, setEditingId] =
    useState("");
  const [editorOpen, setEditorOpen] =
    useState(false);
  const [showPassword, setShowPassword] =
    useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const copy = vi
    ? {
        eyebrow: "Nhân sự và quyền truy cập",
        title: "nhân viên.",
        description:
          "Tạo hồ sơ, tài khoản đăng nhập và quyền hoạt động riêng cho từng nhân viên.",
        add: "Thêm nhân viên",
        search: "Tìm nhân viên",
        placeholder:
          "Tên, mã, tài khoản, số điện thoại...",
        create: "Tạo nhân viên",
        edit: "Chỉnh sửa nhân viên",
        fullName: "Họ và tên",
        phone: "Số điện thoại",
        email: "Email",
        position: "Vị trí công việc",
        role: "Vai trò",
        username: "Tên đăng nhập",
        password: "Mật khẩu tạm",
        hireDate: "Ngày vào làm",
        note: "Ghi chú",
        permissions: "Quyền hoạt động",
        account: "Cho phép đăng nhập",
        active: "Đang làm việc",
        forceChange:
          "Yêu cầu đổi mật khẩu khi đăng nhập",
        cancel: "Hủy",
        save: "Lưu thay đổi",
        saving: "Đang lưu...",
        empty: "Chưa có nhân viên phù hợp.",
        emptyBody:
          "Tạo nhân viên mới hoặc thử từ khóa khác.",
        deactivate: "Ngừng hoạt động",
        deactivateTitle:
          "Ngừng hoạt động nhân viên?",
        deactivateBody:
          "Tài khoản sẽ bị khóa nhưng lịch sử và ca làm vẫn được giữ.",
        created:
          "Đã tạo nhân viên và tài khoản.",
        updated: "Đã cập nhật nhân viên.",
        disabled:
          "Đã khóa tài khoản nhân viên.",
        code: "Mã",
        lastLogin: "Đăng nhập gần nhất",
        never: "Chưa đăng nhập",
      }
    : {
        eyebrow: "Team and access control",
        title: "employees.",
        description:
          "Create employee profiles, login accounts and individual activity permissions.",
        add: "New employee",
        search: "Search employees",
        placeholder:
          "Name, code, username or phone...",
        create: "Create employee",
        edit: "Edit employee",
        fullName: "Full name",
        phone: "Phone",
        email: "Email",
        position: "Position",
        role: "Role",
        username: "Username",
        password: "Temporary password",
        hireDate: "Hire date",
        note: "Notes",
        permissions: "Activity permissions",
        account: "Allow login",
        active: "Active employee",
        forceChange:
          "Require password change",
        cancel: "Cancel",
        save: "Save changes",
        saving: "Saving...",
        empty: "No matching employees.",
        emptyBody:
          "Create a new employee or try another search.",
        deactivate: "Deactivate",
        deactivateTitle:
          "Deactivate this employee?",
        deactivateBody:
          "The login is disabled while history and shifts remain available.",
        created: "Employee account created.",
        updated: "Employee updated.",
        disabled: "Employee account disabled.",
        code: "Code",
        lastLogin: "Last login",
        never: "Never",
      };

  useEffect(() => {
    load();
  }, [refreshToken]);

  const filtered = useMemo(() => {
    const keyword = query
      .trim()
      .toLowerCase();

    return employees.filter((employee) =>
      [
        employee.fullName,
        employee.employeeCode,
        employee.username,
        employee.phone,
        employee.email,
        employee.position,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [employees, query]);

  async function load() {
    try {
      setLoading(true);
      const data = await api.request(
        `/employees?t=${Date.now()}`
      );
      setEmployees(data.employees || []);
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId("");
    setForm(newEmployee());
    setShowPassword(false);
    setEditorOpen(true);
  }

  function openEdit(employee) {
    setEditingId(employee._id);
    setForm({
      fullName: employee.fullName || "",
      phone: employee.phone || "",
      email: employee.email || "",
      position: employee.position || "",
      role: employee.role || "custom",
      username: employee.username || "",
      password: "",
      permissions: employee.permissions || [],
      accountEnabled:
        employee.accountEnabled !== false,
      isActive: employee.isActive !== false,
      mustChangePassword: Boolean(
        employee.mustChangePassword
      ),
      hireDate: employee.hireDate || "",
      note: employee.note || "",
    });
    setShowPassword(false);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditingId("");
    setForm(newEmployee());
    setEditorOpen(false);
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeRole(role) {
    setForm((current) => ({
      ...current,
      role,
      permissions: [
        ...(ROLE_TEMPLATES[role] || []),
      ],
    }));
  }

  function togglePermission(permission) {
    setForm((current) => ({
      ...current,
      role: "custom",
      permissions: current.permissions.includes(
        permission
      )
        ? current.permissions.filter(
            (value) => value !== permission
          )
        : [...current.permissions, permission],
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (
      !editingId &&
      form.password.length < 8
    ) {
      toast.show(
        vi
          ? "Mật khẩu phải có ít nhất 8 ký tự."
          : "Password must contain at least 8 characters.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        fullName: form.fullName.trim(),
        username: form.username
          .trim()
          .toLowerCase(),
        password: undefined,
      };

      if (editingId) {
        await api.request(
          `/employees/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );

        if (form.password.length >= 8) {
          await api.request(
            `/employees/${editingId}/password`,
            {
              method: "PATCH",
              body: JSON.stringify({
                password: form.password,
                mustChangePassword:
                  form.mustChangePassword,
              }),
            }
          );
        }

        toast.show(copy.updated);
      } else {
        await api.request("/employees", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.show(copy.created);
      }

      closeEditor();
      await load();
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      await api.request(
        `/employees/${deleteTarget._id}`,
        { method: "DELETE" }
      );
      setDeleteTarget(null);
      toast.show(copy.disabled);
      await load();
    } catch (error) {
      toast.show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-admin-responsive-page="EmployeesManager" data-no-auto-translate>
      <AdminPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <button
            type="button"
            className="admin-button-primary"
            onClick={openCreate}
          >
            <Plus size={16} />
            {copy.add}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <form
          onSubmit={submit}
          className={[
            "admin-card self-start overflow-hidden xl:sticky xl:top-24",
            editorOpen
              ? "block"
              : "hidden xl:block",
          ].join(" ")}
        >
          {editorOpen ? (
            <>
              <div className="flex items-start justify-between border-b border-trap-blue/10 p-5">
                <div>
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-trap-orange">
                    {editingId
                      ? copy.edit
                      : copy.create}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-trap-blue">
                    {form.fullName || copy.add}
                  </h2>
                </div>
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={closeEditor}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="admin-scrollbar max-h-[calc(100dvh-210px)] overflow-y-auto p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={copy.fullName}
                    value={form.fullName}
                    onChange={(value) =>
                      update("fullName", value)
                    }
                    full
                    required
                  />
                  <Field
                    label={copy.position}
                    value={form.position}
                    onChange={(value) =>
                      update("position", value)
                    }
                  />
                  <Field
                    label={copy.phone}
                    value={form.phone}
                    onChange={(value) =>
                      update("phone", value)
                    }
                  />
                  <Field
                    label={copy.email}
                    value={form.email}
                    type="email"
                    onChange={(value) =>
                      update("email", value)
                    }
                  />

                  <label>
                    <span className="admin-label">
                      {copy.role}
                    </span>
                    <select
                      className="admin-select"
                      value={form.role}
                      onChange={(event) =>
                        changeRole(
                          event.target.value
                        )
                      }
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option
                          key={role.value}
                          value={role.value}
                        >
                          {role[language]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Field
                    label={copy.hireDate}
                    value={form.hireDate}
                    type="date"
                    onChange={(value) =>
                      update("hireDate", value)
                    }
                  />

                  <Field
                    label={copy.username}
                    value={form.username}
                    onChange={(value) =>
                      update("username", value)
                    }
                    full
                    required
                  />

                  <label className="sm:col-span-2">
                    <span className="admin-label">
                      {copy.password}
                    </span>
                    <span className="relative block">
                      <input
                        className="admin-input pr-14"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={form.password}
                        onChange={(event) =>
                          update(
                            "password",
                            event.target.value
                          )
                        }
                        required={!editingId}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-trap-blue"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </span>
                  </label>

                  <Toggle
                    label={copy.account}
                    checked={form.accountEnabled}
                    onChange={(value) =>
                      update(
                        "accountEnabled",
                        value
                      )
                    }
                  />
                  <Toggle
                    label={copy.active}
                    checked={form.isActive}
                    onChange={(value) =>
                      update("isActive", value)
                    }
                  />
                  <Toggle
                    label={copy.forceChange}
                    checked={
                      form.mustChangePassword
                    }
                    onChange={(value) =>
                      update(
                        "mustChangePassword",
                        value
                      )
                    }
                    full
                  />

                  <div className="sm:col-span-2">
                    <p className="admin-label">
                      {copy.permissions}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PERMISSION_OPTIONS.map(
                        (permission) => {
                          const checked =
                            form.permissions.includes(
                              permission.value
                            );

                          return (
                            <button
                              key={permission.value}
                              type="button"
                              onClick={() =>
                                togglePermission(
                                  permission.value
                                )
                              }
                              className={[
                                "flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold",
                                checked
                                  ? "border-trap-blue bg-[#eef1ff] text-trap-blue"
                                  : "border-trap-blue/10 bg-white text-trap-ink/55",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                                  checked
                                    ? "bg-trap-blue text-trap-yellow"
                                    : "bg-slate-100",
                                ].join(" ")}
                              >
                                {checked && (
                                  <Check size={13} />
                                )}
                              </span>
                              {permission[language]}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <label className="sm:col-span-2">
                    <span className="admin-label">
                      {copy.note}
                    </span>
                    <textarea
                      className="admin-textarea"
                      value={form.note}
                      onChange={(event) =>
                        update(
                          "note",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-2 border-t border-trap-blue/10 bg-[#f8f9fd] p-4 sm:grid-cols-2">
                <button
                  type="button"
                  className="admin-button-secondary"
                  onClick={closeEditor}
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  className="admin-button-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving
                    ? copy.saving
                    : copy.save}
                </button>
              </div>
            </>
          ) : (
            <div className="grid min-h-[390px] place-items-center p-8 text-center">
              <div>
                <UsersRound
                  className="mx-auto text-trap-blue"
                  size={34}
                />
                <button
                  type="button"
                  className="admin-button-primary mt-6"
                  onClick={openCreate}
                >
                  <Plus size={16} />
                  {copy.add}
                </button>
              </div>
            </div>
          )}
        </form>

        <section>
          <div className="admin-card mb-5 p-4">
            <label className="relative block">
              <span className="admin-label">
                {copy.search}
              </span>
              <Search
                className="admin-search-icon pointer-events-none absolute"
                size={17}
              />
              <input
                className="admin-input admin-search-control"
                value={query}
                placeholder={copy.placeholder}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
              />
            </label>
          </div>

          {loading ? (
            <div className="admin-card grid min-h-72 place-items-center">
              <Loader2
                className="animate-spin text-trap-blue"
                size={28}
              />
            </div>
          ) : filtered.length ? (
            <div className="grid gap-4">
              {filtered.map((employee) => (
                <article
                  key={employee._id}
                  className="admin-card-flat p-5"
                >
                  <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1ff] text-trap-blue">
                      <UserRound size={23} />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-extrabold text-trap-blue">
                          {employee.fullName}
                        </h2>
                        <span
                          className={[
                            "admin-badge",
                            employee.isActive !==
                            false
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {employee.isActive !==
                          false
                            ? copy.active
                            : copy.deactivate}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-trap-ink/55">
                        {employee.position} ·{" "}
                        {employee.role}
                      </p>

                      <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.1em] text-trap-ink/38">
                        {copy.code}:{" "}
                        {employee.employeeCode} · @
                        {employee.username} ·{" "}
                        {copy.lastLogin}:{" "}
                        {employee.lastLoginAt
                          ? new Date(
                              employee.lastLoginAt
                            ).toLocaleString(
                              vi
                                ? "vi-VN"
                                : "en-US"
                            )
                          : copy.never}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() =>
                          openEdit(employee)
                        }
                      >
                        <Edit3 size={16} />
                      </button>
                      {employee.isActive !==
                        false && (
                        <button
                          type="button"
                          className="grid h-11 w-11 place-items-center rounded-full border border-red-200 bg-red-50 text-red-700"
                          onClick={() =>
                            setDeleteTarget(
                              employee
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title={copy.empty}
              description={copy.emptyBody}
              action={
                <button
                  type="button"
                  className="admin-button-primary"
                  onClick={openCreate}
                >
                  <Plus size={16} />
                  {copy.add}
                </button>
              }
            />
          )}
        </section>
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={copy.deactivateTitle}
        description={copy.deactivateBody}
        confirmLabel={copy.deactivate}
        busy={saving}
        onCancel={() =>
          setDeleteTarget(null)
        }
        onConfirm={deactivate}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  full = false,
  required = false,
}) {
  return (
    <label
      className={
        full ? "sm:col-span-2" : ""
      }
    >
      <span className="admin-label">
        {label}
      </span>
      <input
        className="admin-input"
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  full = false,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "admin-card-flat flex min-h-[74px] items-center justify-between gap-3 p-4 text-left",
        full ? "sm:col-span-2" : "",
        checked
          ? "border-trap-blue bg-[#eef1ff]"
          : "",
      ].join(" ")}
    >
      <b className="text-sm text-trap-blue">
        {label}
      </b>
      <span
        className={[
          "relative h-7 w-12 rounded-full",
          checked
            ? "bg-trap-blue"
            : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
