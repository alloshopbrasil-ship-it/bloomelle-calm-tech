import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista de nomes femininos europeus
const femaleNames = [
  "Sofia", "Emma", "Charlotte", "Amélie", "Camille", "Léa", "Chloé", "Alice",
  "Giulia", "Francesca", "Elena", "Chiara", "Martina", "Valentina", "Aurora",
  "Hanna", "Lena", "Marie", "Anna", "Sophie", "Clara", "Luisa", "Mia",
  "Isabella", "Olivia", "Emilia", "Matilda", "Eva", "Nina", "Stella",
  "Margot", "Adèle", "Zoé", "Inès", "Juliette", "Manon", "Louise",
  "Greta", "Elisa", "Beatrice", "Livia", "Bianca", "Serena", "Lucia"
];

// Lista de cidades europeias
const europeanCities = [
  "Paris, França", "Lisboa, Portugal", "Barcelona, Espanha", "Roma, Itália",
  "Milão, Itália", "Amsterdã, Holanda", "Berlim, Alemanha", "Munique, Alemanha",
  "Viena, Áustria", "Zurique, Suíça", "Bruxelas, Bélgica", "Copenhague, Dinamarca",
  "Estocolmo, Suécia", "Oslo, Noruega", "Praga, República Tcheca",
  "Budapeste, Hungria", "Varsóvia, Polônia", "Dublin, Irlanda", "Edimburgo, Escócia",
  "Madri, Espanha", "Porto, Portugal", "Nice, França", "Lyon, França",
  "Florença, Itália", "Veneza, Itália", "Genebra, Suíça", "Salzburgo, Áustria"
];

// Posts inspiracionais para simular atividade da comunidade
const inspirationalPosts = [
  {
    content: "Hoje acordei me sentindo grata por cada pequena conquista. Às vezes esquecemos de celebrar as vitórias do dia a dia 🌸",
    topic: "gratidão",
    mood_emoji: "😊"
  },
  {
    content: "Descobri que tirar 10 minutos para mim no início do dia muda completamente minha energia. Autocuidado não é egoísmo! 💕",
    topic: "autocuidado",
    mood_emoji: "✨"
  },
  {
    content: "Estou aprendendo a dizer 'não' sem culpa. É difícil, mas necessário para nossa saúde mental 🌷",
    topic: "limites",
    mood_emoji: "💪"
  },
  {
    content: "Ontem foi um dia difícil, mas hoje é uma nova oportunidade. Cada dia é uma página em branco 📖",
    topic: "recomeço",
    mood_emoji: "🌅"
  },
  {
    content: "Compartilhando: meditação de 5 minutos antes de dormir tem me ajudado muito com a ansiedade. Recomendo! 🧘‍♀️",
    topic: "mente",
    mood_emoji: "😌"
  },
  {
    content: "Me permiti chorar hoje e foi libertador. Nossas emoções precisam de espaço para existir 🦋",
    topic: "emoções",
    mood_emoji: "💙"
  },
  {
    content: "Completei minha primeira semana de caminhadas matinais! Pequenos passos, grandes mudanças 🏃‍♀️",
    topic: "corpo",
    mood_emoji: "🌟"
  },
  {
    content: "Percebi que me comparar com outras pessoas só me faz mal. Cada uma tem seu próprio tempo e jornada 🌺",
    topic: "autoestima",
    mood_emoji: "💜"
  },
  {
    content: "Gratidão por esta comunidade de mulheres incríveis. Vocês me inspiram todos os dias! 🤗",
    topic: "comunidade",
    mood_emoji: "❤️"
  },
  {
    content: "Hoje escolhi não ser perfeita e foi maravilhoso. A imperfeição também tem sua beleza 🌻",
    topic: "aceitação",
    mood_emoji: "😊"
  },
  {
    content: "Estabeleci limites saudáveis no trabalho essa semana. Minha saúde mental agradece! 💼",
    topic: "carreira",
    mood_emoji: "✨"
  },
  {
    content: "Descobri um novo hobby: pintar. É incrível como fazer algo com as mãos acalma a mente 🎨",
    topic: "criatividade",
    mood_emoji: "🎨"
  },
  {
    content: "Conversei com uma amiga depois de meses e percebi como conexões verdadeiras fazem bem 👭",
    topic: "relações",
    mood_emoji: "💕"
  },
  {
    content: "Hoje cozinhei algo especial só para mim. Cuidar de si mesma inclui se alimentar com amor 🍳",
    topic: "autocuidado",
    mood_emoji: "😋"
  },
  {
    content: "Aprendi que está tudo bem não ter todas as respostas. A vida é uma jornada de descoberta 🗺️",
    topic: "crescimento",
    mood_emoji: "🌱"
  },
  {
    content: "Fiz uma lista de coisas que me fazem feliz. Às vezes precisamos nos lembrar do básico ✍️",
    topic: "felicidade",
    mood_emoji: "😄"
  },
  {
    content: "Desconectei das redes sociais por um dia inteiro. Minha mente ficou muito mais leve! 📵",
    topic: "detox digital",
    mood_emoji: "🧘‍♀️"
  },
  {
    content: "Acordei mais cedo para ver o nascer do sol. A natureza tem um poder curativo incrível 🌄",
    topic: "natureza",
    mood_emoji: "☀️"
  },
  {
    content: "Escrevi uma carta para meu eu do futuro. Exercício poderoso de visualização e esperança ✉️",
    topic: "futuro",
    mood_emoji: "🌈"
  },
  {
    content: "Celebrando pequenas vitórias: consegui manter uma rotina de sono saudável essa semana! 😴",
    topic: "saúde",
    mood_emoji: "💤"
  }
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminSecret = Deno.env.get('ADMIN_SECRET');
    
    // Check for admin secret in headers
    const authHeader = req.headers.get('x-admin-secret');
    if (!adminSecret || authHeader !== adminSecret) {
      console.warn('Unauthorized access attempt to auto-community-posts');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Selecionar nome e cidade aleatórios
    const randomName = getRandomElement(femaleNames);
    const randomCity = getRandomElement(europeanCities);

    // Usamos um ID fixo para o "sistema" de posts automáticos
    const systemUserId = '00000000-0000-0000-0000-000000000001';

    // Verificar se o perfil do sistema existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', systemUserId)
      .single();

    if (!existingProfile) {
      // Criar perfil do sistema
      await supabase
        .from('profiles')
        .insert({
          id: systemUserId,
          name: randomName,
          email: 'sistema@bloomelle.com',
          avatar_url: null,
          plan_type: 'premium'
        });
    } else {
      // Atualizar o nome para um aleatório a cada post
      await supabase
        .from('profiles')
        .update({ name: randomName })
        .eq('id', systemUserId);
    }

    // Selecionar um post aleatório
    const randomPost = getRandomElement(inspirationalPosts);

    // Adicionar localização ao conteúdo
    const contentWithLocation = `${randomPost.content}\n\n📍 ${randomCity}`;

    // Criar o post na comunidade
    const { data: newPost, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: systemUserId,
        content: contentWithLocation,
        topic: randomPost.topic,
        mood_emoji: randomPost.mood_emoji,
        visibility: 'public',
        is_anonymous: false,
        is_flagged: false,
        likes_count: Math.floor(Math.random() * 15) + 1,
        comments_count: 0,
        saves_count: Math.floor(Math.random() * 5)
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }

    console.log('Post criado com sucesso:', newPost?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post automático criado com sucesso',
        post_id: newPost?.id,
        author: randomName,
        city: randomCity
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função auto-community-posts:', error);
    console.error('auto-community-posts error detail:', error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});