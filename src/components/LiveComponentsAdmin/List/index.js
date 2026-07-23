import { createWithRemoteLoader } from '@kne/remote-loader';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@kne/react-intl';
import withLocale from '../withLocale';
import getColumns from './getColumns';
import FormInner from '../FormInner';

const List = createWithRemoteLoader({
  modules: ['components-admin:BizUnit', 'components-core:Filter', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, menu, pageProps = {}, ...props }) => {
    const [BizUnit, Filter, usePreset] = remoteModules;
    const { SuperSelectFilterItem } = Filter.fields;
    const { formatMessage } = useIntl();
    const { apis } = usePreset();
    const navigate = useNavigate();
    const siteApis = apis?.liveComponentsSite || {};

    return (
      <BizUnit
        {...props}
        isNext
        name="liveComponentsSite"
        apis={{
          list: siteApis.list,
          create: ({ formData }) => Object.assign({}, siteApis.create, { data: formData }),
          save: ({ formData, data }) => {
            const payload = Object.assign({}, formData, { id: data.id });
            delete payload.shorten;
            delete payload.host;
            return Object.assign({}, siteApis.save, { data: payload });
          },
          remove: ({ data }) => Object.assign({}, siteApis.remove, { data: { id: data.id } }),
          setStatus: siteApis.save
        }}
        getColumns={() => getColumns({ formatMessage, navigate })}
        getFormInner={formProps => <FormInner {...formProps} />}
        getActionList={({ data, ...actionProps }) => [
          {
            ...actionProps,
            name: 'manageContent',
            children: formatMessage({ id: 'ManageContent' }),
            onClick: () => {
              if (!data?.id) {
                return;
              }
              navigate(`detail?id=${encodeURIComponent(String(data.id))}`);
            }
          }
        ]}
        filter={{
          list: [
            {
              type: SuperSelectFilterItem,
              props: {
                name: 'status',
                label: formatMessage({ id: 'Status' }),
                single: true,
                interceptor: 'object-output-value',
                options: [
                  { value: 'open', label: formatMessage({ id: 'Open' }) },
                  { value: 'closed', label: formatMessage({ id: 'Close' }) }
                ]
              }
            }
          ]
        }}
        page={{
          title: formatMessage({ id: 'ModuleTitle' }),
          menu,
          ...pageProps
        }}
        options={{
          bizName: formatMessage({ id: 'SiteBizName' }),
          keywordFilterName: 'keyword',
          keywordFilterLabel: formatMessage({ id: 'Keyword' }),
          openStatus: 'open',
          closedStatus: 'closed',
          openButtonProps: { children: formatMessage({ id: 'Open' }) },
          closeButtonProps: { children: formatMessage({ id: 'Close' }) },
          formProps: {
            data: {
              defaultPermission: 'rw'
            }
          },
          tableProps: {
            scroll: { x: 'max-content' },
            pagination: {
              currentName: 'currentPage',
              pageSizeName: 'perPage',
              paramsType: 'params'
            }
          }
        }}
      />
    );
  })
);

export default List;
