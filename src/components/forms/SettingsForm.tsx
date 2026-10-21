import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckboxInput, SelectInput, SubmitButton, TextInput } from '@/components/form-items';
import { LANGUAGES, THEMES } from '../../config';
import { type MapSettings, MapSettingsSchema } from '../../schemas';

interface SettingsFormProps {
  defaultValues: MapSettings;
  onSubmit: (value: MapSettings) => void | Promise<void>;
}

export function SettingsForm({ defaultValues, onSubmit }: SettingsFormProps) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: standardSchemaResolver(MapSettingsSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async data => {
    await onSubmit(data as MapSettings);
  });

  const menuOrientationOptions = useMemo(
    () => [
      { value: 'horizontal', label: t('horizontal') },
      { value: 'vertical', label: t('vertical') },
    ],
    [t],
  );

  const popupLayoutOptions = useMemo(
    () => [
      { value: 'tabs', label: t('popup-layout-tabs') },
      { value: 'stacked', label: t('popup-layout-stacked') },
    ],
    [t],
  );

  return (
    <form
      onSubmit={e => {
        void handleSubmit(e);
      }}
      className="text-base-content bg-base-200 border-base-300"
    >
      <fieldset className="fieldset">
        <legend className="fieldset-legend">{t('settings')}</legend>

        <TextInput form={form} name="titiler_api_url" label={t('titiler-url')} />

        <SelectInput form={form} name="theme" label={t('theme')}>
          {THEMES.map(theme => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </SelectInput>

        <SelectInput form={form} name="language" label={t('language')}>
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </SelectInput>

        <SelectInput form={form} name="menuOrientation" label={t('menu-orientation')}>
          {menuOrientationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectInput>

        <CheckboxInput form={form} name="exclusiveLayers" label={t('exclusive-layers')} />

        <SelectInput form={form} name="popupLayout" label={t('popup-layout')}>
          {popupLayoutOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectInput>

        <SubmitButton isSubmitting={form.formState.isSubmitting} className="mt-4">
          {t('save')}
        </SubmitButton>
      </fieldset>
    </form>
  );
}
