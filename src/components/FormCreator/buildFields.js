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
  Password: { label: '密码', groupName: '基础字段', valueSchema: { type: 'string' } },
  MonthPicker: { label: '月份', groupName: '日期时间', valueSchema: { type: 'string' } },
  WeekPicker: { label: '周', groupName: '日期时间', valueSchema: { type: 'string' } },
  DateRangePicker: {
    label: '日期范围',
    groupName: '日期时间',
    valueSchema: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }
  },
  TimeRangePicker: {
    label: '时间范围',
    groupName: '日期时间',
    valueSchema: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }
  },
  TimePicker: { label: '时间', groupName: '日期时间', valueSchema: { type: 'string' } },
  DatePickerToday: {
    label: '日期（至今）',
    groupName: '日期时间',
    valueSchema: { type: 'array', items: { type: 'string' } }
  },
  Rate: { label: '评分', groupName: '评价组件', valueSchema: { type: 'number' } },
  Slider: { label: '滑块', groupName: '评价组件', valueSchema: { type: 'number' } },
  SalaryInput: { label: '薪资输入', groupName: '业务字段', valueSchema: { type: 'number' } },
  TypeDateRangePicker: {
    label: '类型日期范围',
    groupName: '日期时间',
    valueSchema: { type: 'object' }
  },
  MoneyInput: { label: '金额', groupName: '业务字段', valueSchema: { type: 'number' } },
  PhoneNumber: { label: '手机号', groupName: '业务字段', valueSchema: { type: 'object' } },
  Upload: {
    label: '文件上传',
    groupName: '上传与媒体',
    defaults: { block: true },
    valueSchema: { type: 'array', items: { type: 'object' } }
  },
  Avatar: { label: '头像', groupName: '上传与媒体', valueSchema: { type: 'object' } },
  Signature: { label: '签名', groupName: '上传与媒体', valueSchema: { type: 'object' } },
  ColorPicker: { label: '颜色', groupName: '基础字段', valueSchema: { type: 'string' } },
  AddressInput: { label: '地址输入', groupName: '业务字段', valueSchema: { type: 'string' } },
  InputUpperCase: { label: '大写输入', groupName: '基础字段', valueSchema: { type: 'string' } }
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

const THIRDPARTY_FIELDS = {
  JSONEditor: {
    label: 'JSON 编辑器',
    groupName: '第三方组件',
    component: JSONEditor,
    defaults: { block: true },
    defaultProps: {},
    valueSchema: { type: 'string' }
  },
  CKEditor: {
    label: '富文本编辑器',
    groupName: '第三方组件',
    component: CKEditor,
    defaults: { block: true },
    defaultProps: {},
    valueSchema: { type: 'string' },
    propsSchema: [
      {
        name: 'isMarkdown',
        label: 'Markdown 模式',
        type: 'boolean',
        defaultValue: false
      }
    ]
  }
};

export const buildExtendedFields = (formInfoFields = {}) => {
  const fields = { ...THIRDPARTY_FIELDS };

  FORM_INFO_FIELD_KEYS.forEach(type => {
    const component = formInfoFields[type] || REACT_FORM_ANTD_FALLBACK[type];
    const meta = FIELD_META[type];
    if (!component || !meta) {
      return;
    }
    fields[type] = {
      ...meta,
      component,
      defaultProps: meta.defaultProps || {}
    };
  });

  return fields;
};

export default buildExtendedFields;
