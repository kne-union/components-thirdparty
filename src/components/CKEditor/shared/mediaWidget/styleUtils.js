export const createMediaStyleUtils = ({ figureClass, styleAttribute, styles, defaultHeight }) => {
  const getStyleByName = name => styles.find(style => style.name === name);

  const getFigureClasses = modelElement => {
    const classes = [figureClass];
    const style = getStyleByName(modelElement.getAttribute(styleAttribute));

    if (style?.className) {
      classes.push(style.className);
    }

    if (modelElement.getAttribute('resizedWidth')) {
      classes.push('image_resized');
    }

    return classes;
  };

  const resolveHeight = modelElement => modelElement?.getAttribute('resizedHeight') || defaultHeight;

  const syncFigureStyles = (writer, viewFigure, modelElement) => {
    styles.forEach(style => {
      if (style.className) {
        writer.removeClass(style.className, viewFigure);
      }
    });

    const currentStyle = getStyleByName(modelElement.getAttribute(styleAttribute));

    if (currentStyle?.className) {
      writer.addClass(currentStyle.className, viewFigure);
    }
  };

  const syncFigureSizeStyles = (writer, viewFigure, modelElement) => {
    const width = modelElement.getAttribute('resizedWidth');
    const height = resolveHeight(modelElement);

    if (width) {
      writer.setStyle('width', width, viewFigure);
      writer.addClass('image_resized', viewFigure);
    } else {
      writer.removeStyle('width', viewFigure);
      writer.removeClass('image_resized', viewFigure);
    }

    writer.setStyle('height', height, viewFigure);
  };

  const readStyleFromViewFigure = viewFigure => {
    const imageStyle = styles.find(style => style.className && viewFigure.hasClass(style.className))?.name;

    return imageStyle || null;
  };

  const consumeStyleClasses = (viewFigure, conversionApi) => {
    if (viewFigure.hasClass('image')) {
      conversionApi.consumable.consume(viewFigure, { classes: 'image' });
    }

    styles.forEach(style => {
      if (style.className) {
        conversionApi.consumable.consume(viewFigure, { classes: style.className });
      }
    });

    if (viewFigure.hasClass('image_resized')) {
      conversionApi.consumable.consume(viewFigure, { classes: 'image_resized' });
    }
  };

  return {
    getStyleByName,
    getFigureClasses,
    resolveHeight,
    syncFigureStyles,
    syncFigureSizeStyles,
    readStyleFromViewFigure,
    consumeStyleClasses
  };
};
