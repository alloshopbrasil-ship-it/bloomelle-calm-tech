import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (title: string, eventDate: string, startTime: string, endTime: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      toast({
        title: "Evento criado! 🌸",
        description: `${title} adicionado ao seu calendário`,
      });
      return data;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      toast({
        title: "Erro ao criar evento",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      ));
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      toast({
        title: "Erro ao atualizar evento",
        description: "Não foi possível atualizar o evento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast({
        title: "Evento removido 🗑️",
        description: "O evento foi removido do seu calendário",
      });
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      toast({
        title: "Erro ao remover evento",
        description: "Não foi possível remover o evento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.event_date === date);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    refetch: fetchEvents,
  };
};
