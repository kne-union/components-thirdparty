import { createWithRemoteLoader } from '@kne/remote-loader';
import FormCreatorField from './FormCreatorField';

const FormCreator = createWithRemoteLoader({
  modules: ['components-core:FormInfo@hooks']
})(({ remoteModules, ...props }) => {
  const [hooks] = remoteModules;
  const { useDecorator } = hooks;
  const render = useDecorator(props);
  return render(FormCreatorField);
});

FormCreator.Field = FormCreatorField;

export default FormCreator;
