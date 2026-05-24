import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGS, applyLangToDocument } from "@/lib/i18n";

export function LanguageSwitcher({ variant = "ghost" as const }: { variant?: "ghost" | "outline" }) {
  const { i18n, t } = useTranslation();
  const current = SUPPORTED_LANGS.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGS[0];

  const change = async (code: string) => {
    await i18n.changeLanguage(code);
    applyLangToDocument(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2" aria-label={t("common.language")}>
          <Languages className="size-4" />
          <span className="text-xs">{current.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGS.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => change(l.code)} className={l.code === current.code ? "font-semibold" : ""}>
            {l.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
