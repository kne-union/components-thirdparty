const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert } = antd;
const { useState } = React;
const BaseExample = () => {
  const [value, setValue] = useState(
    'bPDTIzn058R_IfWRRx8VtfMm6x2YHIY5rjARfXVPoLbDdSo4cKbP2G6b56f1Ld3fGYcKVg4ehRqGANlZdzb4zrzq9kwc2QoMpaqovvpdvRndPcA46PL09R9GotQeeLPhbV5WZNQP8Nr9e1s7d8MYdcyIW_X2jkFdDwMLydhN1-A9-XeD8sbGDu2sW_J7GGPnEq3KDZqwJ0_sLO17HAUVh3ms7guygZLhYyscWngsUOVmEX30XR87eSjbe7elwKzU7q-6nnLzjM6Xz1aLbRRrYdFCMiZUxMGVpnIxOBvoIGIMWugGWn9pFZKPxAI3dnMg22dgB_GYkTlNyYRWhGxhFU0i2eqEONXhPj9NXyD1b2scRywlBxx-svMgtFqm-Vx3GKLxiy0jZfJhy-7Lbs69c0Lk9_OEixtJTF_qQl2fp5N2_p6Bfz2JInpSwXWy49ZxkT_I9B9-__hobxurDu9QUtg5bwZqwgi4UiRBI4Y_kwtACUXXAdx33TlnlSIUryPwr0byUJ-Iab4xwn-CHzzQZVdPUVYoIp6GQK7QVvzTl2tXbUoqqqRHgegq6ZOoaS0i16J5Q0QgnubP8496bOKQPXoi8fMOA7-VkZv_elh7WwuR4VbCduQ2nxzFngFH-F9pjdkczEMsbaT2Sfzke2H9_W00'
  );
  return (
    <Flex vertical gap={12}>
      <Alert message={value || '暂无内容'} />
      <LiveComponentEditor defaultValue={value} onChange={setValue} />
    </Flex>
  );
};

render(<BaseExample />);
