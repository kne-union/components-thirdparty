import { createWithRemoteLoader } from '@kne/remote-loader';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import style from '../style.module.scss';

const DRAFT_KEY = '__draft__';

const CaseSelect = createWithRemoteLoader({
  modules: ['components-core:Common@SuperSelectField']
})(
  withLocale(({ remoteModules, cases, currentCase, caseActionsOpen, onSelectCase, onRenameCase, onRemoveCase }) => {
    const [SuperSelectField] = remoteModules;
    const { formatMessage } = useIntl();
    const options = [{ value: DRAFT_KEY, label: formatMessage({ id: 'PostCatDraftRequest' }) }].concat(
      cases.map(item => ({ value: item.id, label: item.name }))
    );
    const current = options.find(item => item.value === (currentCase?.id || DRAFT_KEY));
    return (
      <div className={style['case-select']}>
        <div className={style['case-select-input']}>
          <SuperSelectField
            single
            allowClear={false}
            value={current}
            api={{ loader: () => ({ pageData: options }) }}
            onChange={value => {
              const next = Array.isArray(value) ? value[0] : value;
              const id = next && typeof next === 'object' ? next.value : next;
              onSelectCase(id && id !== DRAFT_KEY ? id : null);
            }}
          />
        </div>
        {currentCase && caseActionsOpen && (
          <>
            <Button icon={<EditOutlined />} aria-label={formatMessage({ id: 'PostCatRenameCase' })} onClick={() => onRenameCase(currentCase)} />
            <Popconfirm title={formatMessage({ id: 'PostCatRemoveCaseConfirm' })} onConfirm={() => onRemoveCase(currentCase)}>
              <Button danger icon={<DeleteOutlined />} aria-label={formatMessage({ id: 'PostCatRemoveCase' })} />
            </Popconfirm>
          </>
        )}
      </div>
    );
  })
);

export default CaseSelect;
