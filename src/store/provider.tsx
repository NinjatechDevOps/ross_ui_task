'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/src/store/store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef(store);

  return <Provider store={storeRef.current}>{children}</Provider>;
}