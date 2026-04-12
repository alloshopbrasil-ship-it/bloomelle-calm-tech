import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusIcon, Sparkles, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newEvent, setNewEvent] = useState({ title: "", time: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { events, loading, addEvent, deleteEvent, getEventsForDate } = useCalendarEvents();

  const selectedDateString = date ? format(date, 'yyyy-MM-dd') : '';
  const dayEvents = getEventsForDate(selectedDateString);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.time || !date) return;

    setIsSubmitting(true);
    const [hours, minutes] = newEvent.time.split(':');
    const startTime = `${hours}:${minutes}:00`;
    
    const endHours = parseInt(hours);
    const endMinutes = parseInt(minutes) + 30;
    const adjustedHours = endHours + Math.floor(endMinutes / 60);
    const adjustedMinutes = endMinutes % 60;
    const endTime = `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}:00`;

    const result = await addEvent(newEvent.title, selectedDateString, startTime, endTime);
    
    if (result) {
      setNewEvent({ title: "", time: "" });
      setDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    await deleteEvent(eventToDelete);
    setEventToDelete(null);
    setDeleteDialogOpen(false);
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Bom dia", emoji: "🌸" };
    if (hour < 18) return { text: "Boa tarde", emoji: "💫" };
    return { text: "Boa noite", emoji: "🌙" };
  };

  const greeting = getGreeting();

  const datesWithEvents = events.map(e => parseISO(e.event_date));

  return (
    <DashboardLayout title="Calendário" className="bg-gradient-to-b from-background via-primary/5 to-accent/10">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="animate-fade-in">
          <h2 className="text-xl md:text-3xl font-light text-foreground mb-1">
            {greeting.text} {greeting.emoji}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Organize suas práticas de autocuidado com amor
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full text-xs md:text-sm px-3 md:px-4">
              <PlusIcon className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Adicionar evento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg">Novo momento de autocuidado 🌸</DialogTitle>
              <DialogDescription>
                Agende um tempo especial para você
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title-header">Nome do evento</Label>
                <Input
                  id="title-header"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ex: Meditação, Leitura..."
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-header">Horário</Label>
                <Input
                  id="time-header"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Data selecionada: {date?.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <Button 
              onClick={handleAddEvent} 
              className="w-full rounded-xl h-11"
              disabled={isSubmitting || !newEvent.title || !newEvent.time}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar evento 🌺"
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Calendar Card */}
        <Card className="w-full rounded-2xl border-border/40 animate-fade-in">
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-transparent p-0 w-full"
              required
              locale={ptBR}
              modifiers={{
                hasEvent: datesWithEvents,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--primary))',
                  textUnderlineOffset: '4px',
                },
              }}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3 border-t px-3 md:px-6 pt-4">
            <div className="flex w-full items-center justify-between">
              <div className="text-sm font-medium">
                {date?.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {events.length} eventos no total
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Events List */}
        <Card className="w-full rounded-2xl border-border/40 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">
                Eventos do dia
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {dayEvents.length} {dayEvents.length === 1 ? 'momento agendado' : 'momentos agendados'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : dayEvents.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <div className="text-3xl md:text-4xl mb-3">🌸</div>
                <p className="text-muted-foreground mb-2 text-sm md:text-base">Nenhum evento neste dia</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Adicione momentos especiais ao seu calendário
                </p>
              </div>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative rounded-xl p-3 md:p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 after:absolute after:inset-y-2 md:after:inset-y-3 after:left-2 md:after:left-3 after:w-1 after:rounded-full after:bg-primary/70"
                >
                  <div className="ml-3 md:ml-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm md:text-base truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatEventTime(event.start_time, event.end_time)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => {
                        setEventToDelete(event.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="mt-4 md:mt-6 rounded-2xl border-border/40 bg-gradient-to-br from-accent/10 to-primary/5 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3 md:gap-4 items-start">
            <div className="text-2xl md:text-3xl">💫</div>
            <div>
              <h4 className="font-semibold mb-1 md:mb-2 text-foreground text-sm md:text-base">Dica de organização</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Reserve pequenos blocos de tempo para autocuidado diariamente. 
                Mesmo 15 minutos fazem diferença na sua jornada de florescimento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-[425px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O evento será removido permanentemente do seu calendário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CalendarPage;
