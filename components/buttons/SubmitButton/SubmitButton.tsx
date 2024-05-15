import { useFormStatus } from 'react-dom';

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      Submit{pending ? 'ting...' : ''}
    </button>
  );
};

export default SubmitButton;
