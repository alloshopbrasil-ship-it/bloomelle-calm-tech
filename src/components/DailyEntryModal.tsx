import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Sparkles } from 'lucide-react';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { imageUrl: string; note: string }) => void;
  date: Date;
}

const DailyEntryModal = ({ isOpen, onClose, onSave, date }: DailyEntryModalProps) => {
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSave = () => {
    onSave({ imageUrl: preview || '', note });
    setPreview(null);
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-gray-800 text-center lowercase">
            registro de hoje 🌸
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className={`
                w-32 h-32 rounded-full border-2 border-dashed border-gray-200 
                flex flex-col items-center justify-center overflow-hidden transition-all
                group-hover:border-[#E58B8B] group-hover:bg-[#F0E6FF]/30
                ${preview ? 'border-none' : ''}
              `}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-300 group-hover:text-[#E58B8B]" />
                    <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">adicionar foto</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase font-bold ml-2">Como você se sentiu hoje?</label>
            <Textarea 
              placeholder="Escreva aqui..."
              className="rounded-2xl border-gray-100 focus:border-[#E58B8B] focus:ring-0 resize-none h-24"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full rounded-full bg-[#E58B8B] hover:bg-[#d47a7a] text-white h-12 shadow-lg shadow-pink-100"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Salvar e Florescer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyEntryModal;