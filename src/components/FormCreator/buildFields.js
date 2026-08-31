import {
  DatePicker as ReactDatePicker,
  DatePickerToday as ReactDatePickerToday,
  Input,
  Rate,
  Slider,
  TimePicker as ReactTimePicker
} from '@kne/react-form-antd';
import JSONEditor from '@components/JSONEditor';
import CKEditor from '@components/CKEditor';
import { createFormatMessage } from './withLocale';

/** FormInfo.fields 中需注册、且不在此排除列表内的字段 type */
export const FORM_INFO_FIELD_KEYS = [
  'Password',
  'MonthPicker',
  'WeekPicker',
  'DateRangePicker',
  'TimeRangePicker',
  'TimePicker',
  'DatePickerToday',
  'Rate',
  'Slider',
  'SalaryInput',
  'TypeDateRangePicker',
  'MoneyInput',
  'PhoneNumber',
  'Upload',
  'Avatar',
  'Signature',
  'ColorPicker',
  'AddressInput',
  'InputUpperCase'
];

const FIELD_META = {
  Password: { labelId: 'FieldPassword', groupId: 'GroupBasic', valueSchema: { type: 'string' } },
  MonthPicker: { labelId: 'FieldMonthPicker', groupId: 'GroupDateTime', valueSchema: { type: 'string' } },
  WeekPicker: { labelId: 'FieldWeekPicker', groupId: 'GroupDateTime', valueSchema: { type: 'string' } },
  DateRangePicker: {
    labelId: 'FieldDateRangePicker',
    groupId: 'GroupDateTime',
    valueSchema: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }
  },
  TimeRangePicker: {
    labelId: 'FieldTimeRangePicker',
    groupId: 'GroupDateTime',
    valueSchema: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }
  },
  TimePicker: { labelId: 'FieldTimePicker', groupId: 'GroupDateTime', valueSchema: { type: 'string' } },
  DatePickerToday: {
    labelId: 'FieldDatePickerToday',
    groupId: 'GroupDateTime',
    valueSchema: { type: 'array', items: { type: 'string' } }
  },
  Rate: { labelId: 'FieldRate', groupId: 'GroupRating', valueSchema: { type: 'number' } },
  Slider: { labelId: 'FieldSlider', groupId: 'GroupRating', valueSchema: { type: 'number' } },
  SalaryInput: { labelId: 'FieldSalaryInput', groupId: 'GroupBusiness', valueSchema: { type: 'number' } },
  TypeDateRangePicker: {
    labelId: 'FieldTypeDateRangePicker',
    groupId: 'GroupDateTime',
    valueSchema: { type: 'object' }
  },
  MoneyInput: { labelId: 'FieldMoneyInput', groupId: 'GroupBusiness', valueSchema: { type: 'number' } },
  PhoneNumber: { labelId: 'FieldPhoneNumber', groupId: 'GroupBusiness', valueSchema: { type: 'object' } },
  Upload: {
    labelId: 'FieldUpload',
    groupId: 'GroupUpload',
    defaults: { block: true },
    valueSchema: { type: 'array', items: { type: 'object' } }
  },
  Avatar: { labelId: 'FieldAvatar', groupId: 'GroupUpload', valueSchema: { type: 'object' } },
  Signature: { labelId: 'FieldSignature', groupId: 'GroupUpload', valueSchema: { type: 'object' } },
  ColorPicker: { labelId: 'FieldColorPicker', groupId: 'GroupBasic', valueSchema: { type: 'string' } },
  AddressInput: { labelId: 'FieldAddressInput', groupId: 'GroupBusiness', valueSchema: { type: 'string' } },
  InputUpperCase: { labelId: 'FieldInputUpperCase', groupId: 'GroupBasic', valueSchema: { type: 'string' } }
};

const REACT_FORM_ANTD_FALLBACK = {
  Password: Input.Password,
  MonthPicker: ReactDatePicker.MonthPicker,
  WeekPicker: ReactDatePicker.WeekPicker,
  DateRangePicker: ReactDatePicker.RangePicker,
  TimeRangePicker: ReactTimePicker.RangePicker,
  TimePicker: ReactTimePicker,
  DatePickerToday: ReactDatePickerToday,
  Rate,
  Slider
};

const resolveMessage = (formatMessage, id) => {
  if (typeof formatMessage === 'function') {
    return formatMessage({ id });
  }
  return id;
};

const buildThirdpartyFields = formatMessage => ({
  JSONEditor: {
    label: resolveMessage(formatMessage, 'FieldJSONEditor'),
    groupName: resolveMessage(formatMessage, 'GroupThirdparty'),
    component: JSONEditor,
    defaults: { block: true },
    defaultProps: {},
    valueSchema: { type: 'string' }
  },
  CKEditor: {
    label: resolveMessage(formatMessage, 'FieldCKEditor'),
    groupName: resolveMessage(formatMessage, 'GroupThirdparty'),
    component: CKEditor,
    defaults: { block: true },
    defaultProps: {},
    valueSchema: { type: 'string' },
    propsSchema: [
      {
        name: 'isMarkdown',
        label: resolveMessage(formatMessage, 'PropIsMarkdown'),
        type: 'boolean',
        defaultValue: false
      }
    ]
  }
});

/**
 * @param {Record<string, any>} [formInfoFields]
 * @param {(descriptor: {id: string}) => string} [formatMessage] 缺省按 zh-CN
 */
export const buildExtendedFields = (formInfoFields = {}, formatMessage) => {
  const t = formatMessage || createFormatMessage('zh-CN');
  const fields = { ...buildThirdpartyFields(t) };

  FORM_INFO_FIELD_KEYS.forEach(type => {
    const component = formInfoFields[type] || REACT_FORM_ANTD_FALLBACK[type];
    const meta = FIELD_META[type];
    if (!component || !meta) {
      return;
    }
    const { labelId, groupId, ...rest } = meta;
    fields[type] = {
      ...rest,
      label: resolveMessage(t, labelId),
      groupName: resolveMessage(t, groupId),
      component,
      defaultProps: meta.defaultProps || {}
    };
  });

  return fields;
};

export default buildExtendedFields;
