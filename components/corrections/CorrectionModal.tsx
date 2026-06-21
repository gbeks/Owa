'use client';

import { Modal } from '@/components/ui/Modal';
import { CorrectionForm } from './CorrectionForm';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  legId: string;
  stepNumber: number;
  onSuccess: () => void;
}

export function CorrectionModal({
  isOpen,
  onClose,
  routeId,
  legId,
  stepNumber,
  onSuccess,
}: CorrectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Flag a correction">
      <CorrectionForm
        routeId={routeId}
        legId={legId}
        stepNumber={stepNumber}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
}
