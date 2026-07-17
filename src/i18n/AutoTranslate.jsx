
import { useEffect } from "react";
import { useI18n } from "./I18nProvider.jsx";
import { translatePhrase } from "./translations.js";

const TEXT_ORIGINAL = new WeakMap();
const ATTRIBUTE_ORIGINAL = new WeakMap();

const TRANSLATABLE_ATTRIBUTES = [
  "placeholder",
  "aria-label",
  "title",
];

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "CODE",
  "PRE",
  "TEXTAREA",
  "OPTION",
]);

function translateTextNode(node, language) {
  const parent = node.parentElement;

  if (!parent || SKIP_TAGS.has(parent.tagName)) {
    return;
  }

  if (parent.closest("[data-no-auto-translate]")) {
    return;
  }

  if (!TEXT_ORIGINAL.has(node)) {
    TEXT_ORIGINAL.set(node, node.nodeValue || "");
  }

  const original = TEXT_ORIGINAL.get(node);
  const translated = translatePhrase(original, language);

  if (node.nodeValue !== translated) {
    node.nodeValue = translated;
  }
}

function translateAttributes(element, language) {
  if (!(element instanceof Element)) return;
  if (element.closest("[data-no-auto-translate]")) return;

  let originals = ATTRIBUTE_ORIGINAL.get(element);

  if (!originals) {
    originals = {};
    ATTRIBUTE_ORIGINAL.set(element, originals);
  }

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) return;

    if (!(attribute in originals)) {
      originals[attribute] = element.getAttribute(attribute) || "";
    }

    const translated = translatePhrase(
      originals[attribute],
      language
    );

    if (element.getAttribute(attribute) !== translated) {
      element.setAttribute(attribute, translated);
    }
  });
}

function translateTree(root, language) {
  if (!root) return;

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language);
    return;
  }

  if (!(root instanceof Element) && root !== document.body) {
    return;
  }

  if (root instanceof Element) {
    translateAttributes(root, language);
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let current = walker.currentNode;

  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      translateTextNode(current, language);
    } else if (current instanceof Element) {
      translateAttributes(current, language);
    }

    current = walker.nextNode();
  }
}

export default function AutoTranslate() {
  const { language } = useI18n();

  useEffect(() => {
    let scheduled = false;

    function run() {
      scheduled = false;
      translateTree(document.body, language);
      translateTree(document.head.querySelector("title"), language);
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(run);
    }

    run();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target, language);
          continue;
        }

        if (mutation.type === "attributes") {
          translateAttributes(mutation.target, language);
          continue;
        }

        mutation.addedNodes.forEach((node) => {
          translateTree(node, language);
        });
      }

      schedule();
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return null;
}
