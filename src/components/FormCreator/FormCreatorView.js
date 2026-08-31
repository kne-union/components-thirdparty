import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import useRefCallback from '@kne/use-ref-callback';
import BaseFormCreator from '@kne/form-creator';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { ensureFormCreatorPreset } from './preset';
import withLocale from './withLocale';

const FormCreatorField = withLocale(
  createWithRemoteLoader({
    modules: ['components-core:Global@usePreset', 'components-core:FormInfo@FormModal', 'components-core:Modal']
  })(({ remoteModules, ...props }) => {
    const [usePreset, FormModal, ModalModule] = remoteModules;
    const Modal = ModalModule?.default ?? ModalModule;
    const preset = usePreset();
    const { formatMessage, locale } = useIntl();
    // form-info >= 0.1.23：renderModal 会带上 formProps，走 components-core FormModal
    // 更早版本：只有 footer/modalRender，退回 Modal + Form 包装
    const renderModal = useRefCallback(({ onCancel, footer, modalRender, children, formProps, ...rest }) => {
      if (formProps?.onSubmit) {
        return (
          <FormModal {...rest} formProps={formProps} onClose={onCancel}>
            {children}
          </FormModal>
        );
      }

      return (
        <Modal
          {...rest}
          onClose={onCancel}
          footer={typeof footer === 'function' ? footer({ close: onCancel }) : footer}
          footerButtons={[]}
        >
          {typeof modalRender === 'function' ? modalRender(children) : children}
        </Modal>
      );
    });
    const [ready, setReady] = useState(false);

    useEffect(() => {
      let cancelled = false;
      setReady(false);
      ensureFormCreatorPreset({
        rules: preset?.formInfo?.rules,
        formatMessage,
        locale
      }).then(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [preset?.formInfo?.rules, formatMessage, locale]);

    if (!ready) {
      return <Spin />;
    }

    return (
      <BaseFormCreator
        {...props}
        locale={props.locale || locale}
        renderModal={props.renderModal || renderModal}
      />
    );
  })
);

const FormCreator = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useDecorator } = hooks;
  const render = useDecorator(props);
  return render(FormCreatorField);
});

FormCreator.Field = FormCreatorField;

export default FormCreator;
