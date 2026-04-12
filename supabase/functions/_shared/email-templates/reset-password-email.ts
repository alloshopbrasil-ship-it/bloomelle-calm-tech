export function ResetPasswordEmail({ url }: { url: string }): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7DCE5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(196,108,137,0.15);">
    <div style="background:linear-gradient(135deg,#C46C89,#EFB8C8);padding:48px 32px;text-align:center;">
      <h1 style="color:#FFFFFF;font-size:26px;margin:0 0 8px;font-weight:700;letter-spacing:-0.3px;">Redefinir sua senha 🔐</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">Vamos te ajudar a acessar sua conta</p>
    </div>
    <div style="padding:36px 32px;">
      <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 16px;">
        Recebemos uma solicitação para redefinir a senha da sua conta na Bloomelle.
      </p>
      <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 28px;">
        Clique no botão abaixo para criar uma nova senha:
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <a href="${url}" style="display:inline-block;background:#C46C89;color:#FFFFFF;padding:14px 40px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(196,108,137,0.3);">
          Redefinir minha senha
        </a>
      </div>
      <div style="background:#F7DCE5;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <p style="color:#C46C89;font-size:13px;line-height:1.6;margin:0;font-weight:500;">
          ⚠️ <strong>Aviso de segurança:</strong> Este link é válido por <strong>10 minutos</strong>. Após esse período, você precisará solicitar um novo link de redefinição.
        </p>
      </div>
      <p style="color:#999;font-size:13px;line-height:1.6;margin:0 0 8px;text-align:center;">
        Se você não solicitou esta mudança, pode ignorar este e-mail com segurança. Sua senha não será alterada.
      </p>
      <div style="border-top:1px solid #F7DCE5;padding-top:24px;margin-top:24px;text-align:center;">
        <p style="color:#bbb;font-size:13px;margin:0;line-height:1.6;">
          Com carinho,<br/><strong style="color:#C46C89;">Equipe Bloomelle</strong> 🌷
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
