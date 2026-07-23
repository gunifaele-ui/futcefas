import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const STATE_DOC = doc(db, 'app_state', 'main');

export function useFirestoreField(fieldName, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const hasSeeded = useRef(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(STATE_DOC, (snap) => {
      const data = snap.data();
      if (data && fieldName in data) {
        setValue(data[fieldName]);
      } else if (!hasSeeded.current) {
        hasSeeded.current = true;
        setDoc(STATE_DOC, { [fieldName]: defaultValue }, { merge: true });
      }
    });
    return unsubscribe;
  }, [fieldName]);

  const updateValue = (newValue) => {
    setValue(newValue);
    setDoc(STATE_DOC, { [fieldName]: newValue }, { merge: true });
  };

  return [value, updateValue];
}
