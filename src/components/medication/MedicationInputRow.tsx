
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Medication } from '@/types/medication';
import { useTranslation } from '@/hooks/useTranslation';

interface MedicationInputRowProps {
  medication: Medication;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const MedicationInputRow: React.FC<MedicationInputRowProps> = ({
  medication,
  index,
  canDelete,
  onUpdate,
  onRemove
}) => {
  const { t, dir } = useTranslation();

  return (
    <div className="flex items-center gap-2 group transition duration-200 animate-in fade-in">
      <div className="flex-1 transition-all duration-200">
        <Input 
          value={medication.name} 
          onChange={(e) => onUpdate(medication.id, e.target.value)} 
          placeholder={`${t('medicationName')} ${index + 1}`}
          className="border border-gray-200 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 text-gray-700"
          dir={dir}
        />
      </div>
      {canDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(medication.id)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default MedicationInputRow;
