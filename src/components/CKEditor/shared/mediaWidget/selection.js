export const createMediaSelectionUtils = ({ modelName, figureClass }) => {
  const findInModelAncestors = node => {
    let parent = node;

    while (parent) {
      if (parent.is?.('element', modelName)) {
        return parent;
      }
      parent = parent.parent;
    }

    return null;
  };

  const getSelected = selection => {
    const selected = selection.getSelectedElement?.();

    if (selected?.is('element', modelName)) {
      return selected;
    }

    for (const position of [selection.focus, selection.anchor]) {
      const fromPosition = findInModelAncestors(position?.parent);

      if (fromPosition) {
        return fromPosition;
      }
    }

    try {
      const range = selection.getFirstRange?.();

      if (range) {
        for (const item of range.getItems()) {
          if (item.is('element', modelName)) {
            return item;
          }

          const inAncestors = findInModelAncestors(item);

          if (inAncestors) {
            return inAncestors;
          }
        }
      }
    } catch {
      // ignore
    }

    return null;
  };

  const findFigureInViewAncestors = node => {
    let parent = node;

    while (parent) {
      if (parent.is?.('element', 'figure') && parent.hasClass(figureClass)) {
        return parent;
      }
      parent = parent.parent;
    }

    return null;
  };

  const getWidgetFromViewSelection = viewSelection => {
    const selected = viewSelection.getSelectedElement();

    if (selected?.is('element', 'figure') && selected.hasClass(figureClass)) {
      return selected;
    }

    for (const position of [viewSelection.focus, viewSelection.anchor]) {
      const figure = findFigureInViewAncestors(position?.parent);

      if (figure) {
        return figure;
      }
    }

    return null;
  };

  const getWidgetFromEditor = editor => {
    const viewFigure = getWidgetFromViewSelection(editor.editing.view.document.selection);

    if (viewFigure) {
      return viewFigure;
    }

    const modelElement = getSelected(editor.model.document.selection);

    if (!modelElement) {
      return null;
    }

    return editor.editing.mapper.toViewElement(modelElement);
  };

  return {
    getSelected,
    getWidgetFromViewSelection,
    getWidgetFromEditor
  };
};
