import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  useState,
} from "react";
import { api } from "../../lib/api.js";
import {
  useToast,
} from "../../components/ui/ToastProvider.jsx";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AdminPasswordCard() {
  const [form, setForm] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNext, setShowNext] =
    useState(false);

  const toast =
    useToast();

  function update(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  async function submit(event) {
    event.preventDefault();

    if (
      !form.currentPassword
    ) {
      toast.show(
        "Enter the current password.",
        "error"
      );
      return;
    }

    if (
      form.newPassword.length < 8
    ) {
      toast.show(
        "The new password must contain at least 8 characters.",
        "error"
      );
      return;
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      toast.show(
        "Password confirmation does not match.",
        "error"
      );
      return;
    }

    if (
      form.currentPassword ===
      form.newPassword
    ) {
      toast.show(
        "Choose a new password that is different from the current password.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const data =
        await api.auth
          .changePassword(form);

      setForm(emptyForm);

      toast.show(
        data?.message ||
        "Password changed successfully."
      );
    } catch (error) {
      toast.show(
        error.message,
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      data-admin-password-card="true"
      className="admin-card p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 border-b border-trap-blue/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef1ff] text-trap-blue">
              <ShieldCheck
                size={21}
              />
            </span>

            <div>
              <h3 className="text-lg font-extrabold text-trap-blue">
                Account security
              </h3>

              <p className="mt-1 text-xs font-medium leading-5 text-trap-ink/45">
                Change the password before handing the Admin account to the store owner.
              </p>
            </div>
          </div>
        </div>

        <span className="admin-badge self-start bg-[#fff9d7] text-trap-blue">
          Encrypted
        </span>
      </div>

      <form
        className="mt-6 grid gap-5"
        onSubmit={submit}
      >
        <PasswordField
          label="Current password"
          value={
            form.currentPassword
          }
          visible={showCurrent}
          onVisible={() =>
            setShowCurrent(
              (value) => !value
            )
          }
          onChange={(value) =>
            update(
              "currentPassword",
              value
            )
          }
          autoComplete="current-password"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="New password"
            value={
              form.newPassword
            }
            visible={showNext}
            onVisible={() =>
              setShowNext(
                (value) => !value
              )
            }
            onChange={(value) =>
              update(
                "newPassword",
                value
              )
            }
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirm new password"
            value={
              form.confirmPassword
            }
            visible={showNext}
            onVisible={() =>
              setShowNext(
                (value) => !value
              )
            }
            onChange={(value) =>
              update(
                "confirmPassword",
                value
              )
            }
            autoComplete="new-password"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-trap-blue/10 bg-[#f8f9fd] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium leading-5 text-trap-ink/50">
            Use at least 8 characters. Changing the owner password revokes other owner sessions.
          </p>

          <button
            type="submit"
            className="admin-button-primary shrink-0"
            disabled={saving}
          >
            {saving ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              <KeyRound
                size={16}
              />
            )}

            {saving
              ? "Changing..."
              : "Change password"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onVisible,
  onChange,
  autoComplete,
}) {
  return (
    <label>
      <span className="admin-label">
        {label}
      </span>

      <span className="relative block">
        <input
          className="admin-input pr-12"
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          autoComplete={
            autoComplete
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />

        <button
          type="button"
          className="absolute inset-y-0 right-1 grid w-10 place-items-center rounded-xl text-trap-blue/55 transition hover:bg-trap-blue/5 hover:text-trap-blue"
          onClick={onVisible}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </span>
    </label>
  );
}
