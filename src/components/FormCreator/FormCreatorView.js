import BaseFormCreator from '@kne/form-creator';
import { getRenderModal } from './preset';

const FormCreatorView = props => {
  const defaultRenderModal = getRenderModal();
  return <BaseFormCreator {...props} renderModal={props.renderModal || defaultRenderModal} />;
};

export default FormCreatorView;
