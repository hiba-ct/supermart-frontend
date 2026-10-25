
import { ReactNode, useEffect, useState } from 'react';

import { IntlProvider, MessageFormatElement } from 'react-intl';

import useConfig from 'hooks/useConfig';
import { I18n } from 'types/config';

type Messages =
  | Record<string, string>
  | Record<string, MessageFormatElement[]>;

const loadLocaleData = (locale: I18n): Promise<{ default: Messages }> => {
  switch (locale) {
    case 'ml':
      return import('utils/locales/ml.json');
    case 'hi':
      return import('utils/locales/hi.json');
    case 'ar':
      return import('utils/locales/ar.json');
    case 'en':
    default:
      return import('utils/locales/en.json');
  }
};

interface Props {
  children: ReactNode;
}

export default function Locales({ children }: Props) {
  const { i18n } = useConfig();

  const [messages, setMessages] = useState<Messages | undefined>();

  useEffect(() => {
    let cancelled = false;

    setMessages(undefined);

    loadLocaleData(i18n)
      .then((data) => {
        if (!cancelled) {
          setMessages(data.default);
        }
      })
      .catch((error) => {
        console.error('Failed to load locale:', error);

        if (!cancelled && i18n !== 'en') {
          import('utils/locales/en.json').then((data) => {
            if (!cancelled) {
              setMessages(data.default);
            }
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [i18n]);

  if (!messages) {
    return null;
  }

  return (
    <IntlProvider
      key={i18n}
      locale={i18n}
      defaultLocale="en"
      messages={messages}
    >
      {children}
    </IntlProvider>
  );
}
