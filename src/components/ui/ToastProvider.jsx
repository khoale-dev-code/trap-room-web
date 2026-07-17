import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const value = useMemo(
    () => ({
      show(message, type = "success") {
        const id = `${Date.now()}-${Math.random()}`;
        setItems((current) => [...current, { id, message, type }]);

        window.setTimeout(
          () =>
            setItems((current) =>
              current.filter((item) => item.id !== id)
            ),
          3500
        );
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed bottom-4 right-4 z-[100] grid max-w-[calc(100vw-2rem)] gap-2">
        {items.map((item) => {
          const Icon = item.type === "error" ? XCircle : CheckCircle2;

          return (
            <div
              key={item.id}
              className={[
                "flex min-w-[280px] items-center gap-3 border border-trap-blue/20 px-4 py-3 text-sm font-bold shadow-[0_12px_40px_rgb(7_17_63_/_18%)]",
                item.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-trap-yellow text-trap-blue",
              ].join(" ")}
            >
              <Icon size={19} />
              {item.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
