interface AnalysisResult {
  score: number
  flags: string[]
}

const PHISHING_PATTERNS: { pattern: RegExp; weight: number; label: string }[] = [
  // Ponaglanie i presja
  { pattern: /pilne|natychmiast|od zaraz|działaj teraz|nie zwlekaj|bezzwłocznie/i, weight: 12, label: "Język ponaglenia" },
  { pattern: /twoje konto.*(zawieszon|ograniczon|limit|zamknięt|zablokowan|dezaktyw)/i, weight: 15, label: "Zagrożenie blokadą konta" },
  { pattern: /w ciągu \d+ (godzin|minut|dni)/i, weight: 10, label: "Presja czasu" },
  { pattern: /brak (odpowiedzi|reakcji|weryfikacji|potwierdzenia)/i, weight: 12, label: "Groźba konsekwencji" },

  // Podejrzane linki i akcje
  { pattern: /kliknij (tutaj|poniżej|w ten link|link)/i, weight: 10, label: "Przynęta na kliknięcie" },
  { pattern: /zweryfikuj (swoje konto|tożsamość|informacje|hasło|dane)/i, weight: 14, label: "Prośba o weryfikację" },
  { pattern: /potwierdź (swoje konto|tożsamość|informacje|hasło|dane)/i, weight: 13, label: "Prośba o potwierdzenie" },
  { pattern: /zaktualizuj (konto|płatność|rozliczenia|informacje)/i, weight: 12, label: "Prośba o aktualizację" },
  { pattern: /http:\/\//i, weight: 8, label: "Niebezpieczny link HTTP" },

  // Wyłudzanie danych
  { pattern: /hasło|dane logowania|pesel|dowód osobisty|karta kredytowa/i, weight: 15, label: "Prośba o wrażliwe dane" },
  { pattern: /wpisz swoje.*(hasło|pin|pesel|kartę kredytową|bank)/i, weight: 18, label: "Bezpośrednie wyłudzanie danych" },
  { pattern: /formularz.?logowania|strona.?logowania/i, weight: 10, label: "Przekierowanie do logowania" },

  // Podszywanie się
  { pattern: /drogi (kliencie|użytkowniku|użytkowniczko|członku|szanowny panie|szanowna pani)/i, weight: 8, label: "Generyczne powitanie" },
  { pattern: /(apple|google|microsoft|amazon|paypal|netflix|pko|mbank|inpost).*(wsparcie|zespół|obsługa|bezpieczeństwo)/i, weight: 12, label: "Podszywanie się pod markę" },
  { pattern: /oficjalny|autoryzowany|legalny|zaufany/i, weight: 6, label: "Przesadne zapewnianie o legalności" },

  // Przynęty finansowe
  { pattern: /(wygrał|zwycięzca|nagroda|gratulacje|spadek|loteria|milion)/i, weight: 16, label: "Obietnica zysku" },
  { pattern: /darmowy (prezent|oferta|pieniądze|iphone|karta|bon)/i, weight: 14, label: "Przynęta na darmowe produkty" },
  { pattern: /(zwrot|rekompensata|nieodebrane|odszkodowanie|paczka)/i, weight: 12, label: "Obietnica zwrotu środków/paczki" },

  // Wskaźniki techniczne
  { pattern: /\.ru\/|\.cn\/|\.tk\/|\.ml\/|\.ga\/|\.cf\//i, weight: 10, label: "Podejrzana domena TLD" },
  { pattern: /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i, weight: 8, label: "Skrócony adres URL" },
  { pattern: /[a-z0-9]{20,}@/i, weight: 6, label: "Podejrzany wzorzec nadawcy" },
  { pattern: /([a-z0-9]+\.){4,}[a-z]{2,}/i, weight: 8, label: "Złożona subdomena" },

  // Manipulacja emocjonalna
  { pattern: /(zauważyliśmy|wykryliśmy|znaleźliśmy).*(nietypowe|podejrzane|nieautoryzowane)/i, weight: 14, label: "Alert budzący niepokój" },
  { pattern: /alert bezpieczeństwa|ostrzeżenie|powiadomienie|naruszenie/i, weight: 12, label: "Straszenie bezpieczeństwem" },
  { pattern: /nieautoryzowany (dostęp|transakcja|aktywność|logowanie)/i, weight: 14, label: "Rzekoma nieautoryzowana aktywność" },

  // Słaba gramatyka / Formatowanie
  { pattern: /uprzejmie prosimy|dokonaj niezbędnego|szanowny Pan\/Pani/i, weight: 6, label: "Nienaturalne sformułowania" },
  { pattern: /!!!|!!!\?|\?\?\?|PILNE!!!/i, weight: 8, label: "Nadmierna interpunkcja" },
  { pattern: /[A-Z]{5,}/g, weight: 5, label: "Nadużywanie wielkich liter" },
]
const SUSPICIOUS_TLDS = [
  "xyz", "top", "gq", "tk", "ml", "cf", "click", "work", "support"
];

const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com"
];

const IMPERSONATION_PATTERNS = [
  /paypa1/i,
  /micr0soft/i,
  /g00gle/i,
  /arnazon/i,
  /faceb00k/i
];

export function analyzeEmailForPhishing(email: string): {emailRiskScore: number, emailFlags: string[]} {
  let suspicious = false
  let emailRiskScore = 0;
  let emailFlags = []

  // 1. Basic format validation
  const basicEmailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!basicEmailRegex.test(email)) {
    suspicious = true
  }

  const [localPart, domain] = email.split("@");

  if (!domain) {
    suspicious = true;
  } else {

    // 2. Disposable domains
    if (DISPOSABLE_DOMAINS.includes(domain.toLowerCase())) {
      suspicious = true;
      emailFlags.push("Tymczasowa domena adresu email")
    }

    // 3. Suspicious TLD
    const tld = domain.split(".").pop()?.toLowerCase();
    if (tld && SUSPICIOUS_TLDS.includes(tld)) {
      emailFlags.push("Podejrzane rozszerzenia adresu email")
      suspicious = true;
    }

    // 4. Many hyphens in domain
    if ((domain.match(/-/g) || []).length > 2) {
      suspicious = true;
    }
  }

  if (localPart) {

    // 5. Excessive digits
    const digitCount = (localPart.match(/\d/g) || []).length;
    if (digitCount > 4) {
      suspicious = true;
    }

    // 6. Long random-looking string
    if (localPart.length > 20 && !localPart.includes(".")) {
      suspicious = true;
    }

    // 7. Brand impersonation patterns
    for (const pattern of IMPERSONATION_PATTERNS) {
      if (pattern.test(email)) {
        suspicious = true;
        break;
      }
    }
  }

  if (suspicious) {
    emailRiskScore += 10;
    emailFlags.push("Podejrzany adres email")
  }

  return {emailRiskScore, emailFlags};
}

export function analyzeEmail(body: string, email: string): AnalysisResult {
  const flags: string[] = []
  let riskScore = 0
  let highlights: string[] = []

  const fullContent = `Email: ${email} | Treść: ${body}`;


  const extractUrls = (text: string): string[] => {

    const urlRegex = /https?:\/\/\S+/gi;

    const matches = text.match(urlRegex);

    // Jeśli nic nie znajdzie, zwracamy pustą tablicę zamiast null
    return matches ? matches : [];
  };
  const links = extractUrls(fullContent);


  PHISHING_PATTERNS.forEach(({ pattern, weight, label }) => {
    const matches = fullContent.match(pattern);
    
    if (matches) {
      flags.push(label)
      riskScore += weight;
      highlights.push(matches[0]);
    }
  });
  const { emailRiskScore, emailFlags } = analyzeEmailForPhishing(email)
  riskScore += emailRiskScore
  flags.push(...emailFlags)

  // Dodatkowa logika dla URL (jeśli nie została ujęta w regexach)
  if (links) {
    links.forEach((l) => {
      // Flagujemy, czy dany link już uznaliśmy za podejrzany, 
      // aby nie dodawać go kilka razy do tablicy highlights
      let isSuspicious = false;

      // 1. Brak szyfrowania (HTTP zamiast HTTPS)
      if (l.startsWith("http://")) {
        riskScore += 10;
        isSuspicious = true;
      }

      // 2. Podejrzane domeny najwyższego poziomu (TLD)
      // Ataki często pochodzą z darmowych lub egzotycznych domen
      const suspiciousTld = /\.(ru|cn|tk|ml|ga|cf|gq|zip)\//i;
      if (suspiciousTld.test(l)) {
        riskScore += 15;
        isSuspicious = true;
      }

      // 3. Skracacze linków (ukrywają prawdziwy cel podróży)
      const shorteners = /(bit\.ly|tinyurl|t\.co|rebrand\.ly|ow\.ly)/i;
      if (shorteners.test(l)) {
        riskScore += 10;
        isSuspicious = true;
      }

      // 4. Użycie adresu IP zamiast nazwy domeny (bardzo rzadkie u legalnych firm)
      // Przykład: http://192.168.1.1/login
      const ipPattern = /\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
      if (ipPattern.test(l)) {
        riskScore += 20;
        isSuspicious = true;
      }

      // 5. Przesadne nagromadzenie subdomen (szum informacyjny)

      const dotCount = (l.match(/\./g) || []).length;
      if (dotCount > 4) {
        riskScore += 12;
        isSuspicious = true;
      }

      // 6. Słowa klucze wyłudzające zaufanie w samym adresie
      const sensitiveInUrl = /(login|logowanie|verify|weryfikacja|secure|bezpieczny|bank|poczta)/i;
      if (sensitiveInUrl.test(l)) {
        riskScore += 8;
        isSuspicious = true;
      }

      // Jeśli którykolwiek test wypadł negatywnie, dodajemy URL do podkreślenia
      if (isSuspicious) {
        highlights.push(l);
        flags.push("Potencjalnie niebezpieczny link")
      }
    })
  }



  // Normalize score to 0-100 range
  const score = Math.min(100, Math.round((riskScore / 80) * 100))
  console.log(highlights)

  return { score, flags }
}
