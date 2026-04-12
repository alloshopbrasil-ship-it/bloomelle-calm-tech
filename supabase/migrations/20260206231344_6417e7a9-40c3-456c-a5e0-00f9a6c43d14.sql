-- Create table to track popup display states for users
CREATE TABLE public.popup_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  popup_type TEXT NOT NULL,
  seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  times_shown INTEGER NOT NULL DEFAULT 1,
  last_shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, popup_type)
);

-- Enable Row Level Security
ALTER TABLE public.popup_states ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own popup states" 
ON public.popup_states 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own popup states" 
ON public.popup_states 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own popup states" 
ON public.popup_states 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_popup_states_updated_at
BEFORE UPDATE ON public.popup_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_popup_states_user_id ON public.popup_states(user_id);
CREATE INDEX idx_popup_states_popup_type ON public.popup_states(popup_type);