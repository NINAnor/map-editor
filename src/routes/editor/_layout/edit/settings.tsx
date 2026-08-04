import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { SettingsForm } from '../../../../components/forms/SettingsForm';
import { useAppActions, useAppStore } from '../../../../hooks/app';
import { MapConfigSchema } from '../../../../types';

export const Route = createFileRoute('/editor/_layout/edit/settings')({
  component: RouteComponent,
});

const style = {
  style: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out',
  },
};

function RouteComponent() {
  const { t } = useTranslation();
  const actions = useAppActions();
  const [configUrl, setConfigUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadConfigFromUrl = useCallback(async () => {
    if (!configUrl.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(configUrl);
      const result = MapConfigSchema.safeParse(response.data);
      if (!result.success) {
        const errorMessage = z.prettifyError(result.error);
        console.error('Config validation failed:', result.error);
        toast.error(
          <div>
            <strong>{t('config-load-error')}</strong>
            <pre className="text-xs mt-2 whitespace-pre-wrap">{errorMessage}</pre>
          </div>,
          { autoClose: false },
        );
        return;
      }
      const config = result.data;
      console.debug('Loaded config from URL:', config);

      useAppStore.setState(state => ({
        ...config,
        actions: state.actions,
      }));
      setConfigUrl('');
      toast.success(t('config-loaded-success'));
    } catch (error) {
      console.error('Failed to load config from URL:', error);
      toast.error(t('config-load-error'));
    } finally {
      setIsLoading(false);
    }
  }, [configUrl, t]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
        const reader = new FileReader();

        // TODO: improve logging and error management
        reader.onabort = () => console.warn('file reading was aborted');
        reader.onerror = () => console.error('file reading has failed');
        reader.onload = () => {
          const result = MapConfigSchema.safeParse(JSON.parse(reader.result as string));
          if (!result.success) {
            const errorMessage = z.prettifyError(result.error);
            console.error('Config validation failed:', result.error);
            toast.error(
              <div>
                <strong>{t('config-load-error')}</strong>
                <pre className="text-xs mt-2 whitespace-pre-wrap">{errorMessage}</pre>
              </div>,
              { autoClose: false },
            );
            return;
          }
          const config = result.data;
          console.debug(config);

          useAppStore.setState(state => ({
            ...config,
            actions: state.actions,
          }));
          toast.success(t('config-loaded-success'));
        };
        reader.readAsText(file);
      });
    },
    [t],
  );

  const settings = useAppStore(store => store.config);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/json': ['.json'],
    },
  });

  return (
    <div className="text-base-content bg-base-200 border-base-300 rounded-box border p-4">
      <h4 className="font-bold">{t('upload-configuration')}</h4>
      <div {...getRootProps(style)}>
        <input {...getInputProps()} />
        <p>{t('drag-drop-config')}</p>
      </div>

      <div className="mt-4">
        <h5 className="font-semibold mb-2">Or load from URL:</h5>
        <div className="flex gap-2">
          <input
            type="url"
            value={configUrl}
            onChange={e => setConfigUrl(e.target.value)}
            placeholder="https://example.com/config.json"
            className="input input-bordered flex-1"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => void loadConfigFromUrl()}
            disabled={!configUrl.trim() || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>

      <SettingsForm defaultValues={settings} onSubmit={value => actions.setSettings(value)} />
    </div>
  );
}
