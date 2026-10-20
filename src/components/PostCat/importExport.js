import { useRef, useState } from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export const readJSONFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export const downloadJSON = (data, filename) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const loadSampleDoc = () => import('./examples/petstore.json').then(module => module.default || module);

export const ImportButton = ({ onImport, onError, children, ...props }) => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button icon={<UploadOutlined />} {...props} loading={loading} onClick={() => inputRef.current?.click()}>
        {children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={async e => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) {
            return;
          }
          setLoading(true);
          try {
            await onImport(await readJSONFile(file));
          } catch (error) {
            onError && onError(error);
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
};
