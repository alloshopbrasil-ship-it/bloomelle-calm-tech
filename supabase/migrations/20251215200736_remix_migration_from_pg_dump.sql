CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: community_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    image_url text,
    topic text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    completion_date date DEFAULT CURRENT_DATE NOT NULL,
    tasks_completed integer DEFAULT 0,
    mood_recorded boolean DEFAULT false,
    affirmations_viewed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    progress integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    category text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT goals_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    image_url text,
    is_pinned boolean DEFAULT false,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    avatar_url text,
    is_private boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    member_count integer DEFAULT 1
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: moods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mood_type text NOT NULL,
    mood_value integer,
    note text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT moods_mood_value_check CHECK (((mood_value >= 0) AND (mood_value <= 100)))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text,
    email text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_anonymous boolean DEFAULT false,
    plan_type text DEFAULT 'free'::text,
    CONSTRAINT profiles_plan_type_check CHECK ((plan_type = ANY (ARRAY['free'::text, 'premium'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_posts community_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_pkey PRIMARY KEY (id);


--
-- Name: daily_completions daily_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_completions
    ADD CONSTRAINT daily_completions_pkey PRIMARY KEY (id);


--
-- Name: daily_completions daily_completions_user_id_completion_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_completions
    ADD CONSTRAINT daily_completions_user_id_completion_date_key UNIQUE (user_id, completion_date);


--
-- Name: daily_tasks daily_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_tasks
    ADD CONSTRAINT daily_tasks_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: group_posts group_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_posts
    ADD CONSTRAINT group_posts_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: moods moods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moods
    ADD CONSTRAINT moods_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_moods_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moods_user_created ON public.moods USING btree (user_id, created_at DESC);


--
-- Name: daily_tasks update_daily_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON public.daily_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: goals update_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: group_posts update_group_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_group_posts_updated_at BEFORE UPDATE ON public.group_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: groups update_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: journal_entries update_journal_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: community_posts community_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_posts
    ADD CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_completions daily_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_completions
    ADD CONSTRAINT daily_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: group_posts group_posts_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_posts
    ADD CONSTRAINT group_posts_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_posts group_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_posts
    ADD CONSTRAINT group_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: groups groups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: moods moods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moods
    ADD CONSTRAINT moods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: group_members Anyone can view group members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view group members" ON public.group_members FOR SELECT USING (true);


--
-- Name: community_posts Anyone can view posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view posts" ON public.community_posts FOR SELECT USING (true);


--
-- Name: groups Anyone can view public groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public groups" ON public.groups FOR SELECT USING (((is_private = false) OR (id IN ( SELECT group_members.group_id
   FROM public.group_members
  WHERE (group_members.user_id = auth.uid())))));


--
-- Name: groups Group creators can delete their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can delete their groups" ON public.groups FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: groups Group creators can update their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: group_posts Group members can create posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can create posts" ON public.group_posts FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (group_id IN ( SELECT group_members.group_id
   FROM public.group_members
  WHERE (group_members.user_id = auth.uid())))));


--
-- Name: group_posts Group members can view posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group members can view posts" ON public.group_posts FOR SELECT USING ((group_id IN ( SELECT group_members.group_id
   FROM public.group_members
  WHERE (group_members.user_id = auth.uid()))));


--
-- Name: group_posts Post authors can delete their posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Post authors can delete their posts" ON public.group_posts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: group_posts Post authors can update their posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Post authors can update their posts" ON public.group_posts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: groups Premium users can create groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Premium users can create groups" ON public.groups FOR INSERT WITH CHECK (((auth.uid() = created_by) AND (( SELECT profiles.plan_type
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'premium'::text)));


--
-- Name: daily_completions Users can create their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own completions" ON public.daily_completions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: goals Users can create their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: journal_entries Users can create their own journal entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: moods Users can create their own moods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own moods" ON public.moods FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: community_posts Users can create their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own posts" ON public.community_posts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_tasks Users can create their own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own tasks" ON public.daily_tasks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: goals Users can delete their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: journal_entries Users can delete their own journal entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: community_posts Users can delete their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own posts" ON public.community_posts FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: daily_tasks Users can delete their own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own tasks" ON public.daily_tasks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: group_members Users can join public groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join public groups" ON public.group_members FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (( SELECT groups.is_private
   FROM public.groups
  WHERE (groups.id = group_members.group_id)) = false)));


--
-- Name: group_members Users can leave groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: daily_completions Users can update their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own completions" ON public.daily_completions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: goals Users can update their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: journal_entries Users can update their own journal entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: community_posts Users can update their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own posts" ON public.community_posts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: daily_tasks Users can update their own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own tasks" ON public.daily_tasks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: daily_completions Users can view their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own completions" ON public.daily_completions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: goals Users can view their own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: journal_entries Users can view their own journal entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: moods Users can view their own moods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own moods" ON public.moods FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: daily_tasks Users can view their own tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own tasks" ON public.daily_tasks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: community_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

--
-- Name: group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: group_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

--
-- Name: journal_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: moods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


