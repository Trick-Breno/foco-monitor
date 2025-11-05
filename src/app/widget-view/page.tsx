import { Suspense } from 'react';
import WidgetLoader from '@/app/widget-view/WidgetLoader'; // Vamos criar este arquivo a seguir
import { WidgetStatus } from './WidgetStatus';

// Esta é a página (Server Component)
export default function WidgetPage() {
  return (
    <div className="p-4">
      <Suspense fallback={<WidgetStatus message="Carregando widget..." />}>
        <WidgetLoader />
      </Suspense>
    </div>
  );
}