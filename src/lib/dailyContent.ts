// Utility functions to get daily affirmations and tips

const affirmations = [
  "Eu mereço tudo de bom que está por vir.",
  "Você é suficiente.",
  "Eu sou capaz de criar a vida que desejo.",
  "Minha jornada é única e valiosa.",
  "Eu escolho o amor próprio todos os dias.",
  "Sou digna de respeito e cuidado.",
  "Cada passo que dou me aproxima dos meus sonhos.",
  "Eu confio no processo da vida.",
  "Minha presença faz diferença no mundo.",
  "Eu mereço descansar e florescer.",
  "Sou forte, resiliente e corajosa.",
  "Minha voz merece ser ouvida.",
  "Eu celebro quem eu sou hoje.",
  "Escolho a paz interior em cada momento.",
  "Eu me permito crescer no meu próprio ritmo.",
  "Sou merecedora de amor e gentileza.",
  "Minhas imperfeições me tornam única.",
  "Eu acolho minhas emoções com compaixão.",
  "Meu autocuidado é uma prioridade.",
  "Eu sou suficiente exatamente como sou.",
  "Escolho acreditar em mim mesma.",
  "Minha energia é valiosa e eu a protejo.",
  "Eu me permito sentir sem julgamento.",
  "Sou a protagonista da minha história.",
  "Eu mereço momentos de alegria e leveza.",
  "Minhas escolhas me fortalecem.",
  "Eu confio na minha intuição.",
  "Sou capaz de superar desafios com graça.",
  "Eu me amo incondicionalmente.",
  "Minha jornada de autocuidado é sagrada.",
  "Eu escolho pensamentos que me elevam."
];

const tips = [
  "Pause 60 segundos e escreva uma coisa que deu certo hoje. Pode ser pequena — ainda assim importa.",
  "Respire fundo 3 vezes. Inspire por 4 segundos, segure por 4, expire por 6. Sua mente agradece.",
  "Escreva uma carta para você mesma do futuro. O que ela diria sobre este momento?",
  "Coloque uma música que você ama e dance por 2 minutos. Movimento cura.",
  "Beba um copo de água com atenção plena. Sinta cada gole nutrindo você.",
  "Liste 3 qualidades suas que você admira. Você é incrível.",
  "Tire 5 minutos para alongar seu corpo. Ele carrega você todos os dias.",
  "Escreva 3 coisas pelas quais você é grata hoje, mesmo as pequenas.",
  "Diga algo gentil para você no espelho. Você merece ouvir isso.",
  "Desligue as notificações por 30 minutos e apenas seja.",
  "Faça algo criativo hoje, mesmo que seja rabiscar.",
  "Leia uma página de um livro que te inspira.",
  "Prepare uma refeição com carinho para você mesma.",
  "Tire uma foto de algo bonito que você viu hoje.",
  "Escreva no diário: Como estou me sentindo agora?",
  "Ouça uma meditação guiada de 5 minutos.",
  "Organize um pequeno espaço ao seu redor. Ordem externa, paz interna.",
  "Envie uma mensagem carinhosa para alguém que você ama.",
  "Desconecte-se das redes sociais por 1 hora hoje.",
  "Coloque uma roupa que te faz sentir bem consigo mesma.",
  "Faça uma lista de sonhos. Não importa quão impossíveis pareçam.",
  "Observe o céu por 2 minutos. Você faz parte de algo maior.",
  "Perdoe-se por algo hoje. Você está fazendo o seu melhor.",
  "Tome um banho demorado e relaxante. Cuide do seu templo.",
  "Escreva uma coisa que você aprendeu esta semana.",
  "Diga não para algo que não te serve mais.",
  "Celebre uma pequena vitória de hoje.",
  "Faça uma pausa de 10 minutos longe das telas.",
  "Acenda uma vela e observe a chama. Permita-se apenas estar.",
  "Sorria para você mesma. Você merece gentileza.",
  "Defina um limite saudável hoje e honre-o."
];

export function getDailyAffirmation(): string {
  const dayOfYear = getDayOfYear();
  return affirmations[dayOfYear % affirmations.length];
}

export function getDailyTip(): string {
  const dayOfYear = getDayOfYear();
  return tips[dayOfYear % tips.length];
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}