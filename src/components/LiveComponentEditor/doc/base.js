const { default: LiveComponentEditor } = _LiveComponentEditor;
const { Flex, Alert, Input } = antd;
const { useState, useRef } = React;
const BaseExample = () => {
  const ref = useRef(null);
  const [value, setValue] = useState(
    'xLLDQzj04FqhornoaHsdfo8iGngI4WY5DgMNRW-oF4xLh7U5j0eEGf0G2ad0E12tXb8ewGSr3Kro2A7uaZzZAVQ_AEiFHKgTXj9hT95sPjxRUSFJRW2Mu1Av11sAIyAjBVEgoAiFKZ6bQGH169OeByvpMSalCQoJ3NIbRPcCh9cE4SmzK6b224dGHDgIeH4uhd2y_70H4cPxqWXUZaepvVcgZQpYvPUvuql2pHeQ5DIB0c5c6Pb18Vf-61qqA13NPohzRF4fMLbyaYlavWe52hCbZVo5UHKPMWbr1HtJbJNaChN1OASpQ7So6r0Wmf6su5wcR_K4GvW-4-zlnHzF1pkT6Mt3P3xg598GXL2RZXgqjgBMIGQLX2Y4rw1NuHt25bwZjLuMzSUky1rIPi9QdwYqkKGNlRJ6wErv_-BBtR8eHDiV1jz-KaZwcmHkaKGXFczVVMwd49F0xOYzmtZlE6eSNxK-fN6PyByCupdMvRoBPdOE5VGirnuAJeqYRZRxbsVAE2D2HNx3nVaLsvDZArE8TjlzeqxyxYnkd52Oa2jJAzPxRzzx-t-z_OSHhq_SDxudxUgcGS529Pt2wEnzE3bwimDSzSirMpxofHIy53SFUjslnTdfsMdm1PDRoCO5KVDzVB6RWcUouqvdarRLJN5ZbRbJIg21Pma7GGzWaW4TB55p14SklPmbNDIJLAZ1y1fHzSD_KNrKi6hwJBvGOmKTUhz-zBhTtkLHl7qA6iXDHG-UT6s-1c4O_WO0'
  );
  return (
    <Flex vertical gap={12}>
      <Alert message={<Input.TextArea variant="borderless" autoSize value={value || ''} onChange={e => ref.current.setValue(e.target.value)} />} />
      <LiveComponentEditor defaultValue={value} onChange={setValue} ref={ref} />
    </Flex>
  );
};

render(<BaseExample />);
