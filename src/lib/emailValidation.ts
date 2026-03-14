// Comprehensive list of disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  // Major disposable providers
  "tempmail.com", "temp-mail.org", "guerrillamail.com", "guerrillamail.net",
  "guerrillamail.org", "guerrillamail.de", "guerrillamail.biz", "guerrillamailblock.com",
  "throwaway.email", "throwaway.com", "mailinator.com", "maildrop.cc",
  "yopmail.com", "yopmail.fr", "yopmail.net", "dispostable.com",
  "sharklasers.com", "guerrillamail.info", "grr.la", "mailnesia.com",
  "tempail.com", "tempr.email", "temp-mail.io", "temp-mail.de",
  "fakeinbox.com", "trashmail.com", "trashmail.me", "trashmail.net",
  "trashmail.org", "trashmail.de", "trashemail.de",
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "20minutemail.com", "20minutemail.it",
  "mailcatch.com", "mail-temporaire.fr", "jetable.org",
  "getairmail.com", "filzmail.com", "inboxbear.com",
  "spamgourmet.com", "mytemp.email", "mohmal.com",
  "emailondeck.com", "tempinbox.com", "burnermail.io",
  "getnada.com", "nada.email", "nada.ltd",
  "crazymailing.com", "harakirimail.com",
  "discard.email", "discardmail.com", "discardmail.de",
  "mailnator.com", "binkmail.com", "bobmail.info",
  "chammy.info", "devnullmail.com", "letthemeatspam.com",
  "mailexpire.com", "mailmoat.com", "mailscrap.com",
  "mailzilla.com", "nomail.xl.cx", "nowmymail.com",
  "spamfree24.org", "spamhereplease.com", "tempomail.fr",
  "throwam.com", "tmpmail.net", "tmpmail.org",
  "wegwerfemail.de", "wegwerfmail.de", "wegwerfmail.net",
  "wh4f.org", "eyepaste.com", "fastacura.com",
  "gustr.com", "imgof.com", "clrmail.com",
  "protonmail.com", // Often used for anonymity (optional - remove if too aggressive)
  "safetymail.info", "mailsac.com", "mintemail.com",
  "anonbox.net", "anonymbox.com", "antichef.com",
  "boun.cr", "burnthismail.com", "byom.de",
  "cool.fr.nf", "correo.blogos.net", "cosmorph.com",
  "courriel.fr.nf", "courrieltemporaire.com",
  "curryworld.de", "cust.in", "dacoolone.com",
  "dandikmail.com", "dayrep.com", "deadaddress.com",
  "despammed.com", "devnullmail.com",
  "digitalsanctuary.com", "dingbone.com",
  "disbox.net", "disbox.org", "disposableaddress.com",
  "disposableemailaddresses.emailmiser.com",
  "disposableinbox.com", "dispose.it",
  "dm.w3internet.co.uk", "dodgeit.com", "dodgit.com",
  "dontreg.com", "dontsendmespam.de",
  "drdrb.com", "dump-email.info", "dumpandjunk.com",
  "dumpyemail.com", "e-mail.com", "e-mail.org",
  "e4ward.com", "easytrashmail.com",
  "einmalmail.de", "emailgo.de", "emailias.com",
  "emailigo.de", "emailinfive.com",
  "emaillime.com", "emailmiser.com",
  "emailproxsy.com", "emails.ga",
  "emailsensei.com", "emailtemporario.com.br",
  "emailto.de", "emailwarden.com", "emailx.at.hm",
  "emailxfer.com", "emz.net", "enterto.com",
  "ephemail.net", "etranquil.com", "etranquil.net",
  "etranquil.org", "evopo.com", "explodemail.com",
  "express.net.ua", "eyepaste.com",
  "mailtemp.info", "mailtothis.com",
  "mailtrash.net", "mailzilla.org",
  "mbx.cc", "mega.zik.dj", "meinspamschutz.de",
  "meltmail.com", "messagebeamer.de",
  "mezimages.net", "ministry-of-silly-walks.de",
  "mintemail.com", "misterpinball.de",
  "mmmmail.com", "mobi.web.id",
  "mobileninja.co.uk", "moncourrier.fr.nf",
  "monemail.fr.nf", "monmail.fr.nf",
  "mt2015.com", "mx0.wwwnew.eu",
  "mypartyclip.de", "myphantom.com",
  "mysamp.de", "myspaceinc.com",
  "myspaceinc.net", "myspaceinc.org",
  "myspacepimpedup.com", "mytrashmail.com",
  "nabala.com", "neomailbox.com",
  "nepwk.com", "nervmich.net",
  "nervtansen.de", "netmails.com",
  "netmails.net", "netzidiot.de",
  "neverbox.com", "no-spam.ws",
  "nobulk.com", "noclickemail.com",
  "nogmailspam.info", "nomail.pw",
  "nomail.xl.cx", "nomail2me.com",
  "nomorespamemails.com", "nospam.ze.tc",
  "nospam4.us", "nospamfor.us",
  "nospammail.net", "nothingtoseehere.ca",
  "nowmymail.com", "nurfuerspam.de",
  "nus.edu.sg", "nwldx.com",
  "objectmail.com", "obobbo.com",
  "odnorazovoe.ru", "oneoffemail.com",
  "onewaymail.com", "oopi.org",
  "ordinaryamerican.net", "otherinbox.com",
  "ourklips.com", "outlawspam.com",
  "ovpn.to", "owlpic.com",
  "pancakemail.com", "pimpedupmyspace.com",
  "pisem.net", "plexolan.de",
  "poczta.onet.pl", "politikerclub.de",
  "pookmail.com", "privacy.net",
  "privatdemail.net", "proxymail.eu",
  "prtnx.com", "punkass.com",
  "putthisinyourspamdatabase.com",
  "qq.com",
  "quickinbox.com",
  "rcpt.at", "reallymymail.com",
  "recode.me", "recursor.net",
  "reliable-mail.com", "rhyta.com",
  "rklips.com", "rmqkr.net",
  "royal.net", "rppkn.com",
  "rtrtr.com", "s0ny.net",
  "safe-mail.net", "safersignup.de",
  "safetymail.info", "safetypost.de",
  "sandelf.de", "saynotospams.com",
  "scatmail.com", "schafmail.de",
  "selfdestructingmail.com", "sendspamhere.com",
  "shiftmail.com", "shitmail.me",
  "shortmail.net", "sibmail.com",
  "skeefmail.com", "slaskpost.se",
  "slipry.net", "slopsbox.com",
  "smashmail.de", "soodonims.com",
  "spam.la", "spam.su", "spam4.me",
  "spamavert.com", "spambob.com",
  "spambob.net", "spambob.org",
  "spambog.com", "spambog.de",
  "spambog.ru", "spambox.info",
  "spambox.irishspringrealty.com",
  "spambox.us", "spamcannon.com",
  "spamcannon.net", "spamcero.com",
  "spamcon.org", "spamcorptastic.com",
  "spamcowboy.com", "spamcowboy.net",
  "spamcowboy.org", "spamday.com",
  "spamex.com", "spamfighter.cf",
  "spamfighter.ga", "spamfighter.gq",
  "spamfighter.ml", "spamfighter.tk",
  "spamfree.eu", "spamfree24.com",
  "spamfree24.de", "spamfree24.eu",
  "spamfree24.info", "spamfree24.net",
  "spamhole.com", "spamify.com",
  "spaminator.de", "spamkill.info",
  "spaml.com", "spaml.de",
  "spammotel.com", "spamobox.com",
  "spamoff.de", "spamslicer.com",
  "spamspot.com", "spamstack.net",
  "spamtrail.com", "spamtrap.ro",
  "speed.1s.fr", "superrito.com",
  "superstachel.de", "suremail.info",
  "svk.jp", "sweetxxx.de",
  "tafmail.com", "tagyoureit.com",
  "talkinator.com", "tapchicuoihoi.com",
  "teewars.org", "teleworm.com",
  "teleworm.us", "temp.emeraldcraft.com",
  "temp.headstrong.de", "tempail.com",
  "tempalias.com", "tempe4mail.com",
  "tempemail.biz", "tempemail.co.za",
  "tempemail.com", "tempemail.net",
  "tempinbox.com", "tempinbox.co.uk",
  "tempmail.eu", "tempmail.it",
  "tempmail2.com", "tempmaildemo.com",
  "tempmailer.com", "tempmailer.de",
  "tempomail.fr", "temporarily.de",
  "temporarioemail.com.br", "temporaryemail.net",
  "temporaryemail.us", "temporaryforwarding.com",
  "temporaryinbox.com", "temporarymailaddress.com",
  "thankyou2010.com", "thisisnotmyrealemail.com",
  "throwawayemailaddress.com", "tittbit.in",
  "tmail.ws", "tmailinator.com",
  "toiea.com", "toomail.biz",
  "tradermail.info", "trash-amil.com",
  "trash-mail.at", "trash-mail.com",
  "trash-mail.de", "trash2009.com",
  "trash2010.com", "trash2011.com",
  "trashdevil.com", "trashdevil.de",
  "trashmail.at", "trashmail.io",
  "trashmail.ws", "trashmailer.com",
  "trashymail.com", "trashymail.net",
  "turual.com", "twinmail.de",
  "tyldd.com", "uggsrock.com",
  "umail.net", "upliftnow.com",
  "uplipht.com", "venompen.com",
  "veryreallyfakeemails.com", "viditag.com",
  "viewcastmedia.com", "viewcastmedia.net",
  "viewcastmedia.org", "vomoto.com",
  "vpn.st", "vsimcard.com",
  "vubby.com", "wasteland.rfc822.org",
  "webemail.me", "weg-werf-email.de",
  "wegwerfadresse.de", "wegwerfmail.info",
  "wegwerfmail.org", "wetrainbayarea.com",
  "wetrainbayarea.org", "whatiaas.com",
  "whatpaas.com", "whyspam.me",
  "wickmail.net", "wilemail.com",
  "willhackforfood.biz", "willselfdestruct.com",
  "winemaven.info", "wronghead.com",
  "wuzup.net", "wuzupmail.net",
  "wwwnew.eu", "x.ip6.li",
  "xagloo.com", "xemaps.com",
  "xents.com", "xjoi.com",
  "xmaily.com", "xoxy.net",
  "yapped.net", "yeah.net",
  "yep.it", "yogamaven.com",
  "yomail.info", "yopmail.gq",
  "ypmail.webarnak.fr.eu.org",
  "yuurok.com", "zehnminutenmail.de",
  "zippymail.info", "zoaxe.com",
  "zoemail.org",
]);

// Remove protonmail from blocklist (legitimate provider)
DISPOSABLE_DOMAINS.delete("protonmail.com");

/**
 * Check if an email domain is a known disposable/temporary email provider
 */
export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
};

/**
 * Validate password strength:
 * - Min 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("min8");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("uppercase");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push("special");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email format (stricter than browser default)
 */
export const isValidEmail = (email: string): boolean => {
  // RFC 5322 simplified
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
