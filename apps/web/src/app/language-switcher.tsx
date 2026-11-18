import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { otherLanguage, useI18n } from '@/lib/i18n';

/**
 * Přepínač jazyka. Ukazuje jazyk, do kterého se přepne – jedno kliknutí, žádné menu.
 * Volbu si pamatuje `I18nProvider` v `localStorage`.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useI18n();
  const target = otherLanguage(language);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('justify-start', className)}
      aria-label={t('app.switchLanguage')}
      onClick={() => setLanguage(target)}
    >
      <Languages className="size-4" aria-hidden />
      {t(`app.languageName.${target}`)}
    </Button>
  );
}
