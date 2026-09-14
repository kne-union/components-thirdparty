import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useIntl } from '@kne/react-intl';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { ensureFormCreatorPreset, isFormCreatorPresetReady } from './preset';
import withLocale from './withLocale';

/**
 * 在渲染前 ensure 扩展字段（PhoneNumber / SalaryInput / DateRangePicker 等）。
 * 编辑器 FormCreator 会自行 ensure；独立 SchemaRenderer / SchemaContent 也必须走这一步。
 */
const withFormCreatorPreset = Component =>
  withLocale(
    createWithRemoteLoader({
      modules: ['components-core:Global@usePreset']
    })(({ remoteModules, ...props }) => {
      const [usePreset] = remoteModules;
      const preset = usePreset();
      const { formatMessage, locale } = useIntl();
      const nextLocale = locale || 'zh-CN';
      const [ready, setReady] = useState(() => isFormCreatorPresetReady(nextLocale));

      useEffect(() => {
        let cancelled = false;
        if (!isFormCreatorPresetReady(nextLocale)) {
          setReady(false);
        }
        ensureFormCreatorPreset({
          rules: preset?.formInfo?.rules,
          formatMessage,
          locale: nextLocale
        }).then(() => {
          if (!cancelled) {
            setReady(true);
          }
        });
        return () => {
          cancelled = true;
        };
      }, [preset?.formInfo?.rules, formatMessage, nextLocale]);

      if (!ready) {
        return <Spin />;
      }

      return <Component {...props} />;
    })
  );

export default withFormCreatorPreset;
