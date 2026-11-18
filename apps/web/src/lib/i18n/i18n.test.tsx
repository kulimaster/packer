import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useI18n } from './context';
import { I18nProvider } from './i18n';
import { cs } from './messages.cs';
import { en } from './messages.en';
import { translate, translatePlural } from './translate';

function Probe() {
  const { t, plural, language, setLanguage } = useI18n();

  return (
    <div>
      <span data-testid="nav">{t('nav.trips')}</span>
      <span data-testid="items">{plural('templateCard.itemCount', 3)}</span>
      <span data-testid="trips">{t('trips.subtitle', { name: 'Martin' })}</span>
      <button type="button" onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}>
        switch
      </button>
    </div>
  );
}

describe('katalog zpráv', () => {
  it('má angličtina stejné klíče jako čeština', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(cs).sort());
  });

  it('najde v angličtině text pro každý český klíč', () => {
    for (const key of Object.keys(cs) as (keyof typeof cs)[]) {
      expect(en[key]).toBeTruthy();
    }
  });

  it('dosadí hodnoty do placeholderů', () => {
    expect(translate('cs', 'tripCard.packed', { packed: 3, total: 8 })).toBe('3 / 8 sbaleno');
    expect(translate('en', 'trips.empty.action')).toBe('Plan your first trip');
  });

  it('nechá neznámý placeholder být, aby chyba byla vidět', () => {
    expect(translate('en', 'tripCard.packed', { packed: 1 })).toBe('1 / {total} packed');
  });

  it('skloňuje česky i anglicky', () => {
    expect(translatePlural('cs', 'templateCard.itemCount', 1)).toBe('1 položka');
    expect(translatePlural('cs', 'templateCard.itemCount', 3)).toBe('3 položky');
    expect(translatePlural('cs', 'templateCard.itemCount', 5)).toBe('5 položek');
    expect(translatePlural('en', 'templateCard.itemCount', 1)).toBe('1 item');
    expect(translatePlural('en', 'templateCard.itemCount', 3)).toBe('3 items');
  });
});

describe('I18nProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = 'cs';
  });

  it('startuje v češtině a přepne do angličtiny', async () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('nav')).toHaveTextContent('Výlety');
    expect(screen.getByTestId('trips')).toHaveTextContent('Přihlášený jako Martin.');

    await userEvent.click(screen.getByRole('button', { name: 'switch' }));

    expect(screen.getByTestId('nav')).toHaveTextContent('Trips');
    expect(screen.getByTestId('trips')).toHaveTextContent('Signed in as Martin.');
  });

  it('uloží volbu jazyka a nastaví lang na <html>', async () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'switch' }));

    expect(window.localStorage.getItem('packer.language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('přečte uložený jazyk při startu', () => {
    window.localStorage.setItem('packer.language', 'en');

    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('nav')).toHaveTextContent('Trips');
  });

  it('respektuje initialLanguage pro storybook', () => {
    render(
      <I18nProvider initialLanguage="en">
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('nav')).toHaveTextContent('Trips');
  });
});
