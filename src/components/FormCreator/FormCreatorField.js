import { useEffect, useMemo, useState } from 'react';
import { App, Spin } from 'antd';
import useRefCallback from '@kne/use-ref-callback';
import BaseFormCreator, { createFieldId, defaultSchema, normalizeSchema } from '@kne/form-creator';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIntl } from '@kne/react-intl';
import { useIsMobile } from '@kne/responsive-utils';
import { ensureFormCreatorPreset } from './preset';
import withLocale from './withLocale';
import TemplateListPanel from './TemplateListPanel';
import SchemaToolbarActions from './SchemaToolbarActions';
import { createDataKey, resolveExtraToolbarList, resolveImportExportOptions } from './formCreatorUtils';
import {
  extractSchemaFromPayload,
  groupTreeToDirectories,
  invokeApi,
  mergeTemplateIntoSchema,
  mergeTemplatesIntoFileSystemView,
  normalizeTemplateList,
  resolveGroupApis,
  resolveGroupTreeData,
  resolveTemplateParentId
} from './templateApi';
import style from './style.module.scss';

const FormCreatorField = withLocale(
  createWithRemoteLoader({
    modules: [
      'components-core:Global@usePreset',
      'components-core:FormInfo',
      'components-core:FormInfo@useFormModal',
      'components-core:Modal@createModalRender',
      'components-admin:GroupSelect@GroupFolderField'
    ]
  })(
    ({
      remoteModules,
      apis,
      value,
      defaultValue,
      onChange,
      extraToolbar,
      groupType = 'form-creator-template',
      valueKey = 'code',
      labelKey = 'name',
      renderModal: _renderModal,
      ...props
    }) => {
      const [usePreset, FormInfo, useFormModal, createModalRender, GroupFolderField] = remoteModules;
      const preset = usePreset();
      const ajax = preset?.ajax;
      const { formatMessage, locale } = useIntl();
      const isMobile = useIsMobile();
      const { message } = App.useApp();
      const formModal = useFormModal();
      const renderModalBase = useMemo(
        () => createModalRender({ footerButtons: [], bodyScroll: true }),
        [createModalRender]
      );
      const defaultRenderModal = useRefCallback(
        ({
          onCancel,
          footer,
          modalRender,
          formProps,
          saveText,
          autoClose,
          cancelText,
          width: _width,
          ...rest
        }) => {
          if (formProps?.onSubmit) {
            return (
              <FormInfo.FormModal
                {...rest}
                formProps={formProps}
                onClose={onCancel}
                okText={saveText}
                cancelText={cancelText}
                autoClose={autoClose}
              />
            );
          }

          const { children, ...modalRest } = rest;
          return renderModalBase({
            ...modalRest,
            onClose: onCancel,
            footer: typeof footer === 'function' ? footer() : footer,
            modalRender,
            children
          });
        }
      );
      const { Input } = FormInfo.fields;

      const groupApis = useMemo(() => resolveGroupApis(apis), [apis]);
      const language = props.locale || locale || 'zh-CN';

      const [ready, setReady] = useState(false);
      const [innerSchema, setInnerSchema] = useState(() => normalizeSchema(defaultValue || defaultSchema()));
      const [groupTree, setGroupTree] = useState([]);
      const [templates, setTemplates] = useState([]);
      const [listLoading, setListLoading] = useState(false);
      const [listRefreshToken, setListRefreshToken] = useState(0);

      const showFolderPane = !!groupApis?.groupList;
      const showSaveTemplate = !!apis?.saveTemplate;
      const canAddFolder = !!(groupApis?.create || groupApis?.save);
      const canEditFolder = !!(groupApis?.save || groupApis?.create);
      const canRemoveFolder = !!groupApis?.remove;

      const controlled = value !== undefined;
      const schema = normalizeSchema(controlled ? value : innerSchema);

      const viewTree = useMemo(
        () =>
          mergeTemplatesIntoFileSystemView(
            groupTreeToDirectories(groupTree, valueKey, labelKey),
            templates,
            valueKey
          ),
        [groupTree, templates, valueKey, labelKey]
      );

      const updateSchema = useRefCallback(nextSchema => {
        const normalized = normalizeSchema(nextSchema);
        if (!controlled) {
          setInnerSchema(normalized);
        }
        onChange?.(normalized);
      });

      const handleApplyTemplate = useRefCallback(templateSchema => {
        updateSchema(
          mergeTemplateIntoSchema(schema, templateSchema, {
            createFieldId,
            createDataKey,
            normalizeSchema
          })
        );
      });

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

      const reloadSideData = useRefCallback(async () => {
        if (!groupApis?.groupList && !apis?.list) {
          setGroupTree([]);
          setTemplates([]);
          return;
        }
        setListLoading(true);
        try {
          const tasks = [];
          if (groupApis?.groupList) {
            tasks.push(
              invokeApi(
                groupApis.groupList,
                { params: { type: groupType, language, output: 'tree' } },
                ajax
              ).then(data => setGroupTree(resolveGroupTreeData(data)))
            );
          } else {
            setGroupTree([]);
          }
          if (apis?.list) {
            tasks.push(
              invokeApi(apis.list, { params: { type: groupType, language } }, ajax).then(data =>
                setTemplates(normalizeTemplateList(data))
              )
            );
          } else {
            setTemplates([]);
          }
          await Promise.all(tasks);
        } catch (error) {
          console.error(error);
          message.error(error?.message || formatMessage({ id: 'TemplateListLoadFail' }));
          setGroupTree([]);
          setTemplates([]);
        } finally {
          setListLoading(false);
        }
      });

      useEffect(() => {
        if (!showFolderPane || !ready) {
          return;
        }
        reloadSideData();
      }, [showFolderPane, ready, listRefreshToken, reloadSideData]);

      const resolveTemplateSchema = useRefCallback(async node => {
        const embedded = extractSchemaFromPayload(node) || extractSchemaFromPayload(node?.raw);
        if (embedded) {
          return embedded;
        }
        if (!apis?.get) {
          return null;
        }
        const id = node.id ?? node.raw?.id;
        const data = await invokeApi(apis.get, { params: { id }, data: { id } }, ajax);
        return extractSchemaFromPayload(data) || extractSchemaFromPayload({ schema: data });
      });

      const openFolderForm = useRefCallback(({ editing = null, parentNode = null } = {}) => {
        const parentId =
          parentNode == null ? null : parentNode.groupId ?? parentNode.raw?.id ?? parentNode.id ?? null;

        const modalApi = formModal({
          title: formatMessage({ id: editing ? 'FolderRenameTitle' : 'FolderAddTitle' }),
          size: 'small',
          formProps: {
            data: {
              name: editing?.name || ''
            },
            onSubmit: async values => {
              const payload = {
                name: values.name,
                type: groupType,
                language
              };
              if (editing) {
                payload.id = editing.groupId ?? editing.raw?.id;
                payload.code = editing.code ?? editing.raw?.code ?? editing.id;
                if (editing.parentId != null) {
                  payload.parentId = editing.parentId;
                } else if (editing.raw?.parentId != null) {
                  payload.parentId = editing.raw.parentId;
                }
              } else {
                payload.parentId = parentId;
              }
              const api = editing ? groupApis.save || groupApis.create : groupApis.create || groupApis.save;
              await invokeApi(api, { data: payload }, ajax);
              message.success(formatMessage({ id: editing ? 'FolderRenameSuccess' : 'FolderAddSuccess' }));
              setListRefreshToken(token => token + 1);
              modalApi.close();
            }
          },
          children: (
            <FormInfo
              column={1}
              list={[
                <Input
                  key="name"
                  name="name"
                  label={formatMessage({ id: 'FolderName' })}
                  rule="REQ"
                  placeholder={formatMessage({ id: 'FolderNamePlaceholder' })}
                />
              ]}
            />
          )
        });
      });

      const handleRemoveFolder = useRefCallback(async node => {
        if (!groupApis?.remove) {
          return;
        }
        await invokeApi(
          groupApis.remove,
          {
            data: {
              id: node.groupId ?? node.raw?.id,
              code: node.code ?? node.raw?.code ?? node.id,
              type: groupType
            }
          },
          ajax
        );
        message.success(formatMessage({ id: 'FolderDeleteSuccess' }));
        setListRefreshToken(token => token + 1);
      });

      const handleSaveTemplate = useRefCallback(() => {
        if (!apis?.saveTemplate) {
          return;
        }
        const modalApi = formModal({
          title: formatMessage({ id: 'SaveTemplateTitle' }),
          size: 'default',
          bodyScroll: true,
          formProps: {
            data: {
              name: '',
              parentId: null
            },
            onSubmit: async values => {
              await invokeApi(
                apis.saveTemplate,
                {
                  data: {
                    name: values.name,
                    parentId: resolveTemplateParentId(values.parentId, valueKey),
                    schema
                  }
                },
                ajax
              );
              message.success(formatMessage({ id: 'SaveTemplateSuccess' }));
              setListRefreshToken(token => token + 1);
              modalApi.close();
            }
          },
          children: (
            <FormInfo
              column={1}
              list={[
                <GroupFolderField
                  key="parentId"
                  name="parentId"
                  label={formatMessage({ id: 'SaveTemplateFolder' })}
                  placeholder={formatMessage({ id: 'SaveTemplateFolderPlaceholder' })}
                  type={groupType}
                  valueKey={valueKey}
                  labelKey={labelKey}
                  single
                  isPopup
                  allowClear
                  interceptor="object-output-value"
                  manageable={canAddFolder}
                  apis={groupApis}
                />,
                <Input
                  key="name"
                  name="name"
                  label={formatMessage({ id: 'SaveTemplateName' })}
                  rule="REQ"
                  placeholder={formatMessage({ id: 'SaveTemplateNamePlaceholder' })}
                />
              ]}
            />
          )
        });
      });

      const importExport = resolveImportExportOptions(props.schemaImportExport);
      const extraToolbarList = resolveExtraToolbarList(extraToolbar, schema);
      const showExtendedToolbar = !!importExport || showSaveTemplate || extraToolbarList.length > 0;

      const toolbarExtra = useMemo(() => {
        if (!showExtendedToolbar) {
          return undefined;
        }
        return (
          <SchemaToolbarActions
            schema={schema}
            onImport={updateSchema}
            showCopy={!!importExport?.showCopy}
            showDownload={!!importExport?.showDownload}
            showImport={!!importExport?.showImport}
            showUpload={!!importExport?.showUpload}
            showSave={showSaveTemplate}
            onSave={handleSaveTemplate}
            downloadFileName={importExport?.downloadFileName || 'form-schema.json'}
            extraList={extraToolbarList}
          />
        );
      }, [
        schema,
        showExtendedToolbar,
        importExport,
        extraToolbarList,
        showSaveTemplate,
        updateSchema,
        handleSaveTemplate
      ]);

      if (!ready) {
        return <Spin />;
      }

      const creator = (
        <div
          className={[
            style['form-creator-responsive-root'],
            showFolderPane && style['form-creator-responsive-root-nested']
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <BaseFormCreator
            {...props}
            value={schema}
            onChange={updateSchema}
            locale={props.locale || locale}
            schemaImportExport={false}
            extraToolbar={toolbarExtra}
            renderModal={_renderModal || defaultRenderModal}
          />
        </div>
      );

      if (!showFolderPane) {
        return creator;
      }

      return (
        <div className={style['form-creator-shell-boundary']}>
          <div
            className={[
              style['form-creator-shell'],
              style['form-creator-shell-with-templates'],
              isMobile && style['is-mobile']
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <TemplateListPanel
              tree={viewTree}
              loading={listLoading}
              onReload={() => setListRefreshToken(token => token + 1)}
              resolveSchema={resolveTemplateSchema}
              onApply={handleApplyTemplate}
              canAddFolder={canAddFolder}
              canEditFolder={canEditFolder}
              canRemoveFolder={canRemoveFolder}
              onAddFolder={parentNode => openFolderForm({ parentNode })}
              onRenameFolder={node => openFolderForm({ editing: node })}
              onRemoveFolder={handleRemoveFolder}
            />
            <div className={style['creator-pane']}>{creator}</div>
          </div>
        </div>
      );
    }
  )
);

export default FormCreatorField;
