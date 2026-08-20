const ITEM_PAYLOAD_KEYS = ['shape', 'sizeRange', 'rotationRange', 'rotationStep', 'gridSize', 'drawOutOfBound', 'keepAspect', 'shrinkToFit', 'maskImage', 'left', 'top', 'right', 'bottom'];

export const normalizeWordCloudData = (data = []) =>
  data.map(item => {
    if (Array.isArray(item)) {
      const [name, value, color] = item;
      return {
        value: [name, value],
        itemStyle: color ? { color } : undefined
      };
    }
    if (item && Array.isArray(item.value)) {
      return item;
    }
    const itemStyle = item.itemStyle || (item.color || item.fontWeight ? { color: item.color, fontWeight: item.fontWeight } : undefined);
    return Object.assign(
      {
        value: [item.name, item.value]
      },
      itemStyle ? { itemStyle } : null,
      item.meta ? { meta: item.meta } : null
    );
  });

export const buildWordCloudOption = props => {
  const { data, tooltip = true, option } = props || {};
  const itemPayload = {};
  ITEM_PAYLOAD_KEYS.forEach(key => {
    if (props && props[key] != null) {
      itemPayload[key] = props[key];
    }
  });
  if (itemPayload.shape == null) {
    itemPayload.shape = 'circle';
  }
  if (itemPayload.sizeRange == null) {
    itemPayload.sizeRange = [12, 36];
  }
  if (itemPayload.rotationRange == null) {
    itemPayload.rotationRange = [0, 0];
  }
  if (itemPayload.gridSize == null) {
    itemPayload.gridSize = 8;
  }

  return Object.assign(
    {
      tooltip: tooltip === true ? { show: true } : tooltip || { show: false },
      series: [
        {
          type: 'custom',
          renderItem: 'wordCloud',
          coordinateSystem: 'none',
          itemPayload,
          data: normalizeWordCloudData(data)
        }
      ]
    },
    option
  );
};
