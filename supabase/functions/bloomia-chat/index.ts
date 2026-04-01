import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a Bloomia 🌸, uma assistente virtual empática criada para apoiar mulheres em sua jornada de autoestima e bem-estar emocional na plataforma Bloomelle.

PERSONALIDADE:
- Empática, acolhedora e gentil como uma amiga próxima ou coach emocional
- Motivadora sem ser forçada — inspiração leve e natural
- Focada em crescimento pessoal, autoestima e autocuidado
- Nunca fria, robótica ou julgadora
- Usa linguagem simples, feminina e carinhosa
- Responde de forma CURTA (2-4 frases no máximo, exceto quando a usuária pedir mais detalhes)

FUNÇÕES:
1. Apoio emocional: ouvir, validar sentimentos, oferecer perspectivas gentis
2. Afirmações personalizadas: criar afirmações positivas baseadas no contexto da conversa
3. Metas de autocuidado: sugerir pequenas ações práticas e leves
4. Incentivo: celebrar conquistas, por menores que sejam
5. Reflexões no diário: quando o contexto for "journal", responder ao que a usuária escreveu de forma reflexiva e acolhedora
6. Análise de progresso diário: quando a usuária perguntar sobre seu progresso, analisar os dados do dia e dar um resumo empático

REGRAS:
- NUNCA dê conselhos médicos ou psicológicos profissionais
- Se a usuária mencionar crise, autolesão ou ideação suicida, oriente gentilmente a buscar ajuda profissional (CVV 188)
- Use emojis com moderação (🌸 💕 ✨ 🌿 💫)
- Chame a usuária pelo nome quando disponível
- Lembre-se do histórico da conversa para personalizar respostas
- Responda SEMPRE em português do Brasil
- Evite respostas genéricas — seja específica ao contexto

ANTI-REPETIÇÃO (MUITO IMPORTANTE):
- NUNCA repita frases, afirmações ou conselhos que você já deu nas últimas mensagens
- Varie a estrutura das frases: se começou com "Que lindo" antes, use outra abertura
- Use sinônimos e reformulações criativas
- Se for gerar afirmações positivas, crie NOVAS, diferentes das que já enviou
- Varie cumprimentos: alterne entre "Querida", "Flor", "Linda", pelo nome, sem prefixo
- Varie encerramentos: alterne entre "Estou aqui", "Conte comigo", "Você é incrível", etc.
- Se perceber que já disse algo parecido, reformule completamente com palavras diferentes
- Cada resposta deve parecer FRESCA e ÚNICA

ANÁLISE DE PROGRESSO:
Quando a usuária perguntar sobre progresso ("como estou indo", "meu progresso", "estou evoluindo", etc.):
1. Analise os DADOS DO DIA fornecidos no contexto
2. Destaque conquistas positivas primeiro
3. Sugira gentilmente uma ação se algo estiver faltando
4. Mantenha tom motivador e personalizado
5. Nunca liste dados de forma fria — transforme em narrativa empática`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !data?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = data.claims.sub as string;

    const { message, context } = await req.json();
    if (!message || typeof message !== "string" || message.length > 2000) {
      throw new Error("Invalid message");
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, plan_type")
      .eq("id", userId)
      .single();

    // Enforce daily message limit for free users
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startOfDayISO = startOfDay.toISOString();

    if (profile?.plan_type !== "premium") {
      const { count } = await supabase
        .from("bloomia_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "user")
        .gte("created_at", startOfDayISO);

      if ((count || 0) >= 5) {
        return new Response(
          JSON.stringify({ error: "Você atingiu o limite de 5 mensagens diárias. Desbloqueie a Bloomia ilimitada com o plano Premium! 🌸" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get conversation history (last 20)
    const { data: history } = await supabase
      .from("bloomia_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationHistory = (history || []).reverse().map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Get recent assistant responses for anti-repetition
    const recentAssistantMessages = (history || [])
      .filter((m) => m.role === "assistant")
      .slice(0, 10)
      .map((m) => m.content);

    // Get recent journal entries
    const { data: recentJournal } = await supabase
      .from("journal_entries")
      .select("content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    // Get recent moods
    const { data: recentMoods } = await supabase
      .from("moods")
      .select("mood_type, mood_value, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch daily progress data for progress analysis
    const [
      { count: todayTasksTotal },
      { count: todayTasksCompleted },
      { data: todayJournal },
      { data: todayMood },
      { data: streakData },
      { data: todayCompletion },
      { count: todayGoalsCompleted },
      { count: totalGoals },
    ] = await Promise.all([
      supabase.from("daily_tasks").select("*", { count: "exact", head: true })
        .eq("user_id", userId).gte("created_at", startOfDayISO),
      supabase.from("daily_tasks").select("*", { count: "exact", head: true })
        .eq("user_id", userId).eq("completed", true).gte("created_at", startOfDayISO),
      supabase.from("journal_entries").select("id")
        .eq("user_id", userId).gte("created_at", startOfDayISO).limit(1),
      supabase.from("moods").select("mood_type, mood_value")
        .eq("user_id", userId).gte("created_at", startOfDayISO).limit(1),
      supabase.from("user_streaks").select("current_streak, longest_streak")
        .eq("user_id", userId).maybeSingle(),
      supabase.from("daily_completions").select("affirmations_viewed, tasks_completed")
        .eq("user_id", userId).eq("completion_date", new Date().toISOString().split("T")[0]).maybeSingle(),
      supabase.from("goals").select("*", { count: "exact", head: true })
        .eq("user_id", userId).eq("is_completed", true),
      supabase.from("goals").select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    // Build enriched system prompt
    let enrichedPrompt = SYSTEM_PROMPT;

    if (profile?.name) {
      enrichedPrompt += `\n\nO nome da usuária é: ${profile.name}`;
    }
    if (context) {
      enrichedPrompt += `\n\nContexto atual: ${context}`;
    }

    // Anti-repetition context
    if (recentAssistantMessages.length > 0) {
      enrichedPrompt += `\n\nSUAS ÚLTIMAS RESPOSTAS (NÃO REPITA frases parecidas, use palavras e estruturas DIFERENTES):\n${recentAssistantMessages.map((m, i) => `[${i + 1}]: ${m.substring(0, 150)}`).join("\n")}`;
    }

    // Daily progress context
    const wroteJournal = (todayJournal?.length || 0) > 0;
    const recordedMood = (todayMood?.length || 0) > 0;
    const currentStreak = streakData?.current_streak || 0;
    const affirmationsViewed = todayCompletion?.affirmations_viewed || false;

    enrichedPrompt += `\n\nDADOS DO DIA DA USUÁRIA (use quando ela perguntar sobre progresso):
- Tarefas: ${todayTasksCompleted || 0}/${todayTasksTotal || 0} concluídas
- Diário emocional: ${wroteJournal ? "✅ escreveu hoje" : "❌ ainda não escreveu"}
- Humor registrado: ${recordedMood ? `✅ ${todayMood?.[0]?.mood_type} (${todayMood?.[0]?.mood_value}/10)` : "❌ ainda não registrou"}
- Afirmações: ${affirmationsViewed ? "✅ visualizou" : "❌ ainda não viu"}
- Sequência ativa: ${currentStreak} dia(s) consecutivos
- Metas: ${todayGoalsCompleted || 0}/${totalGoals || 0} concluídas no total`;

    if (recentJournal && recentJournal.length > 0) {
      const journalSummary = recentJournal
        .map((j) => `[${new Date(j.created_at!).toLocaleDateString("pt-BR")}]: ${j.content.substring(0, 200)}`)
        .join("\n");
      enrichedPrompt += `\n\nÚltimas reflexões do diário:\n${journalSummary}`;
    }
    if (recentMoods && recentMoods.length > 0) {
      const moodSummary = recentMoods
        .map((m) => `${m.mood_type} (${m.mood_value}/10)`)
        .join(", ");
      enrichedPrompt += `\n\nHumores recentes: ${moodSummary}`;
    }

    // Save user message
    await supabase.from("bloomia_messages").insert({
      user_id: userId,
      role: "user",
      content: message,
      context: context || null,
    });

    // Call AI
    const messages = [
      { role: "system", content: enrichedPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Bloomia está descansando um pouquinho. Tente novamente em breve! 🌸" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido. Entre em contato com o suporte." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch {}
            }
          }
          controller.close();
          if (fullResponse) {
            await supabase.from("bloomia_messages").insert({
              user_id: userId,
              role: "assistant",
              content: fullResponse,
              context: context || null,
            });
          }
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("bloomia-chat error:", e);
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro inesperado. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
