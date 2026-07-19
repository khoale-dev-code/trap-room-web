import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { api } from "../../lib/api.js";
import {
  useToast,
} from "../../components/ui/ToastProvider.jsx";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function scorePassword(value) {
  const password =
    String(value || "");

  return [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export default function AdminPasswordCard() {
  const [open, setOpen] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const toast = useToast();

  const strength = useMemo(
    () => scorePassword(
      form.newPassword
    ),
    [form.newPassword]
  );

  const valid = Boolean(
    form.currentPassword &&
    form.newPassword.length >= 8 &&
    form.newPassword ===
      form.confirmPassword &&
    form.currentPassword !==
      form.newPassword
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        closeDialog();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, saving]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetDialogState() {
    setForm(emptyForm);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  function closeDialog() {
    if (saving) {
      return;
    }

    setOpen(false);
    resetDialogState();
  }

  async function submit(event) {
    event.preventDefault();

    if (!form.currentPassword) {
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
        "Choose a password different from the current password.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const data =
        await api.auth
          .changePassword(form);

      toast.show(
        data?.message ||
        "Password changed successfully."
      );

      setOpen(false);
      resetDialogState();
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
    <>
      <button
        type="button"
        className="admin-password-trigger"
        onClick={() =>
          setOpen(true)
        }
      >
        <ShieldCheck size={18} />
        <span>Security</span>
      </button>

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div
              className="admin-password-overlay"
              role="presentation"
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeDialog();
                }
              }}
            >
              <section
                className="admin-password-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-password-title"
              >
                <header className="admin-password-dialog-header">
                  <span className="admin-password-dialog-icon">
                    <LockKeyhole
                      size={25}
                    />
                  </span>

                  <div>
                    <span className="admin-password-eyebrow">
                      Account security
                    </span>

                    <h2 id="admin-password-title">
                      Change admin password
                    </h2>

                    <p>
                      Update the password before handing this Admin account to the store owner.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-password-close"
                    onClick={closeDialog}
                    disabled={saving}
                    aria-label="Close password dialog"
                  >
                    <X size={20} />
                  </button>
                </header>

                <form
                  className="admin-password-form"
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
                    autoFocus
                  />

                  <div className="admin-password-field-grid">
                    <PasswordField
                      label="New password"
                      value={
                        form.newPassword
                      }
                      visible={showNew}
                      onVisible={() =>
                        setShowNew(
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
                      visible={showConfirm}
                      onVisible={() =>
                        setShowConfirm(
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

                  <PasswordStrength
                    value={
                      form.newPassword
                    }
                    score={strength}
                  />

                  <div className="admin-password-note">
                    <ShieldCheck
                      size={19}
                    />

                    <span>
                      Changing the owner password signs out other owner sessions. This device remains signed in.
                    </span>
                  </div>

                  <footer className="admin-password-actions">
                    <button
                      type="button"
                      className="admin-password-cancel"
                      onClick={closeDialog}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="admin-password-submit"
                      disabled={
                        saving ||
                        !valid
                      }
                    >
                      {saving ? (
                        <Loader2
                          className="animate-spin"
                          size={19}
                        />
                      ) : (
                        <KeyRound
                          size={19}
                        />
                      )}

                      {saving
                        ? "Changing..."
                        : "Change password"}
                    </button>
                  </footer>
                </form>
              </section>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function PasswordField({
  label,
  value,
  visible,
  onVisible,
  onChange,
  autoComplete,
  autoFocus = false,
}) {
  return (
    <label className="admin-password-field">
      <span>{label}</span>

      <div>
        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          autoComplete={
            autoComplete
          }
          autoFocus={autoFocus}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />

        <button
          type="button"
          onClick={onVisible}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </label>
  );
}

function PasswordStrength({
  value,
  score,
}) {
  const labels = [
    "Enter a new password",
    "Very weak",
    "Weak",
    "Fair",
    "Strong",
    "Very strong",
  ];

  const checks = [
    {
      label: "8+ characters",
      valid:
        value.length >= 8,
    },
    {
      label: "Upper and lowercase",
      valid:
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value),
    },
    {
      label: "Number",
      valid:
        /\d/.test(value),
    },
    {
      label: "Special character",
      valid:
        /[^A-Za-z0-9]/.test(
          value
        ),
    },
  ];

  return (
    <div className="admin-password-strength">
      <div className="admin-password-strength-heading">
        <span>Password strength</span>
        <b>{labels[score]}</b>
      </div>

      <div
        className="admin-password-strength-bars"
        aria-hidden="true"
      >
        {[1, 2, 3, 4, 5].map(
          (item) => (
            <span
              key={item}
              data-active={
                score >= item
                  ? "true"
                  : "false"
              }
            />
          )
        )}
      </div>

      <div className="admin-password-checks">
        {checks.map((item) => (
          <span
            key={item.label}
            data-valid={
              item.valid
                ? "true"
                : "false"
            }
          >
            <CheckCircle2
              size={14}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
