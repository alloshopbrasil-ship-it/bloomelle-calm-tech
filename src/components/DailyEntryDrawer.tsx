import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Sparkles, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { imageUrl: string; note: string }) => void;
  date: Date;
}

export const DailyEntryDrawer = ({ isOpen, onClose, onSave, date }: DailyEntryDrawerProps) => {
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
    if (preview) {
      onSave({ imageUrl: preview, note });
      setPreview(null);
      setNote('');
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-white rounded-t-[40px] border-none max-h-[90vh]">
        <div className="mx-auto w-12 h-1.5 bg-gray-100 rounded-full mt-4 mb-2" />
        
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-2xl font-light text-gray-800 lowercase">
            registro de {format(date, "eeee, d 'de' MMMM", { locale: ptBR })} 🌸
          </DrawerTitle>
          <DrawerDescription className="text-xs uppercase tracking-widest text-gray-400 font-bold">
            capture sua evolução
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-10 space-y-8 overflow-y-auto">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className={`
                w-40 h-40 rounded-full border-2 border-dashed border-gray-100 
                flex flex-col items-center justify-center overflow-hidden transition-all
                hover:border-[#E58B8B] hover:bg-[#F0E6FF]/20
                ${preview ? 'border-none shadow-xl' : ''}
              `}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-gray-200 group-hover:text-[#E58B8B] transition-colors" />
                    <span className="text-[10px] text-gray-400 mt-3 uppercase font-bold tracking-tighter">adicionar foto</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              
              {preview && (
                <button 
                  onClick={(e) => { e.preventDefault(); setPreview(null); }}
                  className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1.5 text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 uppercase font-bold ml-2 tracking-widest">
              Como você se sentiu hoje?
            </label>
            <Textarea 
              placeholder="Escreva aqui seus pensamentos..."
              className="rounded-[24px] border-gray-50 bg-gray-50/50 focus:bg-white focus:border-[#E58B8B] focus:ring-0 resize-none h-32 transition-all"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={!preview}
            className="w-full rounded-full bg-[#E58B8B] hover:bg-[#d47a7a] text-white h-14 shadow-lg shadow-pink-100 text-lg font-light transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Salvar e Florescer
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};