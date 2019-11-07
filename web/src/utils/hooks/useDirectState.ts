import { useCallback, useState } from 'react';

const useDirectState = <T>(initState: T) => {
  const [value, setValue] = useState<T>(initState);
  const onChange = useCallback((value) => setValue(value), []);
  return { value, onChange };
};
export default useDirectState;