
-- Create bloomia_messages table for conversation memory
CREATE TABLE public.bloomia_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  context text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bloomia_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON public.bloomia_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON public.bloomia_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON public.bloomia_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_bloomia_messages_user_id ON public.bloomia_messages(user_id, created_at DESC);
