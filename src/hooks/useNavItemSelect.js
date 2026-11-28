import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { scrollToTarget } from '../utils/scroll';

/** Nav items either route to a page (`path`) or scroll to a home section (`target`). */
export function useNavItemSelect(onComplete) {
  const navigate = useNavigate();

  return useCallback(
    (item) => {
      if (item.path) {
        navigate(item.path);
        onComplete?.();
        return;
      }

      scrollToTarget(item.target, { onComplete });
    },
    [navigate, onComplete],
  );
}
