export function WelcomeEmail(name: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7DCE5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(196,108,137,0.15);">
    <div style="background:linear-gradient(135deg,#C46C89,#EFB8C8);padding:48px 32px;text-align:center;">
      <h1 style="color:#FFFFFF;font-size:28px;margin:0 0 8px;font-weight:700;letter-spacing:-0.3px;">Bem-vinda à Bloomelle ✨</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;font-weight:400;">Seu espaço de autocuidado começa agora</p>
    </div>
    <div style="padding:36px 32px;">
      <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 16px;">
        Olá, <strong style="color:#C46C89;">${name}</strong>! 🌸
      </p>
      <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 16px;">
        Estamos muito felizes em ter você aqui. A Bloomelle foi criada com carinho para te acompanhar no seu dia a dia — com práticas de autocuidado, journaling, afirmações e muito mais.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 28px;">
        Comece agora seu primeiro dia e descubra tudo que preparamos especialmente para você.
      </p>
      <div style="text-align:center;margin:0 0 32px;">
        <a href="https://bloomelle-calm-tech.lovable.app/dashboard" style="display:inline-block;background:#C46C89;color:#FFFFFF;padding:14px 40px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(196,108,137,0.3);">
          Começar agora 💗
        </a>
      </div>
      <div style="border-top:1px solid #F7DCE5;padding-top:24px;text-align:center;">
        <p style="color:#bbb;font-size:13px;margin:0;line-height:1.6;">
          Com carinho,<br/><strong style="color:#C46C89;">Equipe Bloomelle</strong> 🌷
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
