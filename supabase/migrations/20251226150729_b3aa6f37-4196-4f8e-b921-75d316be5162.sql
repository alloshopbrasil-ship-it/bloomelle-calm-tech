-- Create user_streaks table for streak system
CREATE TABLE public.user_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_streaks_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();