import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const SUPPORTED_LANGS = [
  { code: "ar", name: "العربية", dir: "rtl" as const },
  { code: "en", name: "English", dir: "ltr" as const },
  { code: "fr", name: "Français", dir: "ltr" as const },
  { code: "es", name: "Español", dir: "ltr" as const },
  { code: "tr", name: "Türkçe", dir: "ltr" as const },
  { code: "ur", name: "اردو", dir: "rtl" as const },
  { code: "hi", name: "हिन्दी", dir: "ltr" as const },
];

const resources = {
  ar: { translation: {
    common: {
      loading: "جارٍ التحميل...",
      save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", create: "إنشاء",
      confirm: "تأكيد", back: "رجوع", search: "بحث", language: "اللغة",
      yes: "نعم", no: "لا", or: "أو", required: "مطلوب",
      success: "تم بنجاح", error: "حدث خطأ", retry: "إعادة المحاولة",
      pageNotFound: "الصفحة غير موجودة", home: "الرئيسية",
    },
    nav: {
      dashboard: "الرئيسية", listings: "الإعلانات", platforms: "المنصات",
      jobs: "مهام النشر", activity: "السجل", admin: "لوحة الإدارة",
      login: "تسجيل الدخول", signup: "إنشاء حساب", logout: "تسجيل الخروج",
      startFree: "ابدأ مجاناً",
    },
    landing: {
      badge: "APIs رسمية فقط — بدون محاكاة ولا تجاوز للسياسات",
      h1a: "انشر مرة واحدة.", h1b: "يصل الإعلان للجميع.",
      sub: "لوحة نشر مركزية لإعلاناتك العقارية والتجارية — Facebook Pages، Bayut، Property Finder، Dubizzle، ومواقع مخصصة عبر REST/Webhook. كله من محرر واحد، بسجل أداء حي وجدولة ذكية.",
      ctaStart: "ابدأ النشر الآن",
      footer: "نستخدم APIs الرسمية فقط، ونحترم شروط استخدام كل منصة.",
      f1t: "نشر متعدد المنصات", f1d: "Facebook Pages + Marketplace Catalog، Bayut/PF عبر XML Feeds الرسمية، Dubizzle bulk، وأي REST مخصص.",
      f2t: "أضف منصة جديدة فوراً", f2d: "واجهة لإضافة أي API/Webhook — URL + Headers + قالب Body — بدون كود.",
      f3t: "سجل تشغيل حي", f3d: "تابع كل مهمة لحظياً: قائمة الانتظار، التقدم، النجاح/الفشل، والرد الكامل من المنصة.",
      f4t: "جدولة وأوقات ذروة", f4d: "قائمة تنفيذ منظمة + احترام rate-limits الرسمية وrefresh credits لكل منصة.",
      f5t: "محرر إعلان موحد", f5d: "نموذج واحد يتكيّف لكل منصة: عنوان، وصف، صور، سعر، فئة، موقع، تواصل.",
      f6t: "صلاحيات وأدوار", f6d: "Super Admin / Admin / Manager / Agent / Viewer + موافقة على التسجيلات الجديدة.",
    },
    auth: {
      loginTitle: "تسجيل الدخول", signupTitle: "إنشاء حساب جديد",
      email: "البريد الإلكتروني", password: "كلمة المرور", fullName: "الاسم الكامل",
      submitLogin: "دخول", submitSignup: "إنشاء الحساب", loggingIn: "جارٍ الدخول...",
      noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب؟",
      passwordTooShort: "كلمة المرور 8 أحرف على الأقل",
      loggedIn: "تم تسجيل الدخول", signedUpPending: "تم إنشاء الحساب — في انتظار موافقة الإدارة",
    },
    dashboard: {
      welcome: "مرحباً، {{name}}", overview: "نظرة عامة على نشاطك في CrossCast",
      listings: "إعلانات", platforms: "منصات", jobs: "مهام النشر", success: "نجحت", failed: "فشلت",
      pendingNote: "حسابك قيد المراجعة من قِبل الإدارة. لن تتمكن من النشر حتى تتم الموافقة.",
      pending: "في انتظار الموافقة", banned: "محظور",
    },
    listings: {
      title: "الإعلانات", sub: "إعلاناتك الموحّدة الجاهزة للنشر",
      empty: "لا توجد إعلانات بعد. أضف أول إعلان لك.",
      newBtn: "إعلان جديد", create: "إنشاء إعلان",
      publish: "نشر", chooseTargets: "اختر المنصات للنشر",
      noPlatforms: "لا توجد منصات مفعّلة.", addPlatform: "أضِف منصة",
      pickOne: "اختر منصة واحدة على الأقل",
      runNow: "تنفيذ الآن", deleted: "تم الحذف", created: "تم إنشاء الإعلان",
      jobsCreated: "تم إنشاء {{n}} مهمة، يتم التنفيذ...",
      kind: "النوع", titleField: "العنوان", desc: "الوصف",
      price: "السعر", currency: "العملة", category: "الفئة", location: "الموقع",
      kindAd: "إعلان", kindVideo: "فيديو", kindReel: "ريل", kindStory: "حالة",
    },
    platforms: {
      title: "المنصات", sub: "إعدادات منصات النشر — يتم استخدام APIs الرسمية لكل منصة",
      empty: "لا توجد منصات بعد. أضف أول منصة لك.",
      newBtn: "منصة جديدة", create: "إضافة منصة",
      name: "الاسم", kind: "النوع", configJson: "الإعدادات (JSON)",
      badJson: "JSON غير صحيح", added: "تم إضافة المنصة",
      enabled: "مفعّل", disabled: "معطّل",
      hintFb: "مثال FB:",
    },
    jobs: {
      title: "مهام النشر", sub: "متابعة حية لجميع عمليات النشر — يتم التحديث لحظياً",
      empty: "لا توجد مهام بعد.",
      viewPost: "عرض المنشور →", viewResponse: "عرض رد المنصة",
      queued: "في الانتظار", running: "قيد التنفيذ", success: "نجحت", failed: "فشلت", cancelled: "ملغاة",
    },
    activity: {
      title: "سجل النشاط", subAll: "كل أنشطة المستخدمين", subMine: "أنشطتك",
      empty: "لا توجد سجلات.",
    },
    admin: {
      title: "لوحة الإدارة", sub: "إدارة الحسابات والصلاحيات",
      activate: "تفعيل", ban: "حظر", confirmDelete: "حذف الحساب نهائياً؟",
      roles: "الأدوار:", grantRole: "+ منح دور",
      statusActive: "مفعّل", statusBanned: "محظور", statusPending: "بانتظار الموافقة",
      updated: "تم التحديث", deleted: "تم الحذف", granted: "تم منح الدور",
    },
  }},
  en: { translation: {
    common: {
      loading: "Loading...", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit",
      create: "Create", confirm: "Confirm", back: "Back", search: "Search", language: "Language",
      yes: "Yes", no: "No", or: "or", required: "Required",
      success: "Success", error: "An error occurred", retry: "Retry",
      pageNotFound: "Page not found", home: "Home",
    },
    nav: {
      dashboard: "Dashboard", listings: "Listings", platforms: "Platforms",
      jobs: "Publish Jobs", activity: "Activity", admin: "Admin Panel",
      login: "Sign in", signup: "Sign up", logout: "Sign out", startFree: "Start free",
    },
    landing: {
      badge: "Official APIs only — no spoofing, no policy bypass",
      h1a: "Publish once.", h1b: "Reach everywhere.",
      sub: "A central publishing console for your real-estate and marketplace listings — Facebook Pages, Bayut, Property Finder, Dubizzle and any custom REST/Webhook site. All from one editor, with live performance logs and smart scheduling.",
      ctaStart: "Start publishing",
      footer: "We only use official APIs and respect each platform's terms of service.",
      f1t: "Multi-platform publishing", f1d: "Facebook Pages + Marketplace Catalog, Bayut/PF via official XML feeds, Dubizzle bulk, and any custom REST.",
      f2t: "Add a new platform instantly", f2d: "UI to add any API/Webhook — URL + Headers + Body template — no code.",
      f3t: "Live activity log", f3d: "Track every job in real time: queue, progress, success/failure, and full platform response.",
      f4t: "Scheduling & peak times", f4d: "Orderly queue + respect for official rate-limits and refresh credits per platform.",
      f5t: "Unified ad editor", f5d: "One form that adapts to each platform: title, description, photos, price, category, location, contact.",
      f6t: "Roles & permissions", f6d: "Super Admin / Admin / Manager / Agent / Viewer + approval for new sign-ups.",
    },
    auth: {
      loginTitle: "Sign in", signupTitle: "Create your account",
      email: "Email", password: "Password", fullName: "Full name",
      submitLogin: "Sign in", submitSignup: "Create account", loggingIn: "Signing in...",
      noAccount: "No account?", hasAccount: "Already have an account?",
      passwordTooShort: "Password must be at least 8 characters",
      loggedIn: "Signed in", signedUpPending: "Account created — waiting for admin approval",
    },
    dashboard: {
      welcome: "Welcome, {{name}}", overview: "An overview of your CrossCast activity",
      listings: "Listings", platforms: "Platforms", jobs: "Publish jobs", success: "Succeeded", failed: "Failed",
      pendingNote: "Your account is under review. You won't be able to publish until approved.",
      pending: "Pending approval", banned: "Banned",
    },
    listings: {
      title: "Listings", sub: "Your unified ads ready to publish",
      empty: "No listings yet. Add your first listing.",
      newBtn: "New listing", create: "Create listing",
      publish: "Publish", chooseTargets: "Choose platforms to publish to",
      noPlatforms: "No enabled platforms.", addPlatform: "Add a platform",
      pickOne: "Pick at least one platform",
      runNow: "Run now", deleted: "Deleted", created: "Listing created",
      jobsCreated: "{{n}} job(s) created, running...",
      kind: "Kind", titleField: "Title", desc: "Description",
      price: "Price", currency: "Currency", category: "Category", location: "Location",
      kindAd: "Ad", kindVideo: "Video", kindReel: "Reel", kindStory: "Story",
    },
    platforms: {
      title: "Platforms", sub: "Publishing platform settings — official APIs are used for each",
      empty: "No platforms yet. Add your first one.",
      newBtn: "New platform", create: "Add platform",
      name: "Name", kind: "Kind", configJson: "Settings (JSON)",
      badJson: "Invalid JSON", added: "Platform added",
      enabled: "Enabled", disabled: "Disabled",
      hintFb: "FB example:",
    },
    jobs: {
      title: "Publish jobs", sub: "Live tracking for all publishing operations — updates in real time",
      empty: "No jobs yet.",
      viewPost: "View post →", viewResponse: "View platform response",
      queued: "Queued", running: "Running", success: "Succeeded", failed: "Failed", cancelled: "Cancelled",
    },
    activity: {
      title: "Activity log", subAll: "All user activity", subMine: "Your activity",
      empty: "No logs.",
    },
    admin: {
      title: "Admin panel", sub: "Manage accounts and permissions",
      activate: "Activate", ban: "Ban", confirmDelete: "Permanently delete this account?",
      roles: "Roles:", grantRole: "+ Grant role",
      statusActive: "Active", statusBanned: "Banned", statusPending: "Pending approval",
      updated: "Updated", deleted: "Deleted", granted: "Role granted",
    },
  }},
  fr: { translation: {
    common: { loading: "Chargement...", save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", create: "Créer", confirm: "Confirmer", back: "Retour", search: "Rechercher", language: "Langue", yes: "Oui", no: "Non", or: "ou", required: "Requis", success: "Succès", error: "Une erreur est survenue", retry: "Réessayer", pageNotFound: "Page introuvable", home: "Accueil" },
    nav: { dashboard: "Tableau de bord", listings: "Annonces", platforms: "Plateformes", jobs: "Tâches de publication", activity: "Activité", admin: "Administration", login: "Connexion", signup: "Inscription", logout: "Déconnexion", startFree: "Commencer gratuitement" },
    landing: { badge: "APIs officielles uniquement", h1a: "Publiez une fois.", h1b: "Atteignez tout le monde.", sub: "Console de publication centralisée pour vos annonces immobilières et marketplace.", ctaStart: "Commencer", footer: "Nous utilisons uniquement les APIs officielles.", f1t: "Publication multi-plateforme", f1d: "Facebook, Bayut, PF, Dubizzle et REST personnalisé.", f2t: "Ajout instantané de plateforme", f2d: "Interface pour ajouter n'importe quelle API/Webhook.", f3t: "Journal en direct", f3d: "Suivez chaque tâche en temps réel.", f4t: "Planification", f4d: "File d'attente respectant les limites officielles.", f5t: "Éditeur unifié", f5d: "Un formulaire s'adapte à chaque plateforme.", f6t: "Rôles & permissions", f6d: "Super Admin / Admin / Manager / Agent / Viewer." },
    auth: { loginTitle: "Connexion", signupTitle: "Créer un compte", email: "E-mail", password: "Mot de passe", fullName: "Nom complet", submitLogin: "Se connecter", submitSignup: "Créer le compte", loggingIn: "Connexion...", noAccount: "Pas de compte ?", hasAccount: "Déjà inscrit ?", passwordTooShort: "Mot de passe d'au moins 8 caractères", loggedIn: "Connecté", signedUpPending: "Compte créé — en attente d'approbation" },
    dashboard: { welcome: "Bienvenue, {{name}}", overview: "Aperçu de votre activité CrossCast", listings: "Annonces", platforms: "Plateformes", jobs: "Tâches", success: "Réussies", failed: "Échouées", pendingNote: "Votre compte est en cours de révision.", pending: "En attente", banned: "Banni" },
    listings: { title: "Annonces", sub: "Vos annonces unifiées prêtes à publier", empty: "Aucune annonce.", newBtn: "Nouvelle annonce", create: "Créer une annonce", publish: "Publier", chooseTargets: "Choisir les plateformes", noPlatforms: "Aucune plateforme activée.", addPlatform: "Ajouter une plateforme", pickOne: "Sélectionnez au moins une plateforme", runNow: "Exécuter", deleted: "Supprimé", created: "Annonce créée", jobsCreated: "{{n}} tâche(s) créée(s)", kind: "Type", titleField: "Titre", desc: "Description", price: "Prix", currency: "Devise", category: "Catégorie", location: "Lieu", kindAd: "Annonce", kindVideo: "Vidéo", kindReel: "Reel", kindStory: "Story" },
    platforms: { title: "Plateformes", sub: "Paramètres des plateformes", empty: "Aucune plateforme.", newBtn: "Nouvelle plateforme", create: "Ajouter", name: "Nom", kind: "Type", configJson: "Configuration (JSON)", badJson: "JSON invalide", added: "Plateforme ajoutée", enabled: "Activée", disabled: "Désactivée", hintFb: "Exemple FB :" },
    jobs: { title: "Tâches de publication", sub: "Suivi en direct", empty: "Aucune tâche.", viewPost: "Voir le post →", viewResponse: "Voir la réponse", queued: "En file", running: "En cours", success: "Réussie", failed: "Échec", cancelled: "Annulée" },
    activity: { title: "Journal d'activité", subAll: "Toute l'activité", subMine: "Votre activité", empty: "Aucun log." },
    admin: { title: "Administration", sub: "Gérer comptes et permissions", activate: "Activer", ban: "Bannir", confirmDelete: "Supprimer définitivement ?", roles: "Rôles :", grantRole: "+ Accorder", statusActive: "Actif", statusBanned: "Banni", statusPending: "En attente", updated: "Mis à jour", deleted: "Supprimé", granted: "Rôle accordé" },
  }},
  es: { translation: {
    common: { loading: "Cargando...", save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar", create: "Crear", confirm: "Confirmar", back: "Volver", search: "Buscar", language: "Idioma", yes: "Sí", no: "No", or: "o", required: "Requerido", success: "Éxito", error: "Ocurrió un error", retry: "Reintentar", pageNotFound: "Página no encontrada", home: "Inicio" },
    nav: { dashboard: "Panel", listings: "Anuncios", platforms: "Plataformas", jobs: "Tareas", activity: "Actividad", admin: "Administración", login: "Iniciar sesión", signup: "Registrarse", logout: "Cerrar sesión", startFree: "Comenzar gratis" },
    landing: { badge: "Solo APIs oficiales", h1a: "Publica una vez.", h1b: "Llega a todos.", sub: "Consola central de publicación.", ctaStart: "Empezar", footer: "Solo APIs oficiales.", f1t: "Publicación multi-plataforma", f1d: "Facebook, Bayut, PF, Dubizzle.", f2t: "Añade plataforma al instante", f2d: "Cualquier API/Webhook.", f3t: "Registro en vivo", f3d: "Sigue cada tarea.", f4t: "Programación", f4d: "Respeta los límites oficiales.", f5t: "Editor unificado", f5d: "Un formulario por plataforma.", f6t: "Roles & permisos", f6d: "Super Admin / Admin / etc." },
    auth: { loginTitle: "Iniciar sesión", signupTitle: "Crear cuenta", email: "Correo", password: "Contraseña", fullName: "Nombre completo", submitLogin: "Entrar", submitSignup: "Crear cuenta", loggingIn: "Entrando...", noAccount: "¿Sin cuenta?", hasAccount: "¿Ya tienes cuenta?", passwordTooShort: "Mínimo 8 caracteres", loggedIn: "Sesión iniciada", signedUpPending: "Cuenta creada — pendiente de aprobación" },
    dashboard: { welcome: "Bienvenido, {{name}}", overview: "Resumen de tu actividad", listings: "Anuncios", platforms: "Plataformas", jobs: "Tareas", success: "Exitosas", failed: "Fallidas", pendingNote: "Cuenta en revisión.", pending: "Pendiente", banned: "Bloqueado" },
    listings: { title: "Anuncios", sub: "Tus anuncios listos", empty: "Sin anuncios.", newBtn: "Nuevo anuncio", create: "Crear anuncio", publish: "Publicar", chooseTargets: "Elige plataformas", noPlatforms: "Sin plataformas activas.", addPlatform: "Añadir plataforma", pickOne: "Elige al menos una", runNow: "Ejecutar", deleted: "Eliminado", created: "Anuncio creado", jobsCreated: "{{n}} tarea(s) creadas", kind: "Tipo", titleField: "Título", desc: "Descripción", price: "Precio", currency: "Moneda", category: "Categoría", location: "Ubicación", kindAd: "Anuncio", kindVideo: "Vídeo", kindReel: "Reel", kindStory: "Historia" },
    platforms: { title: "Plataformas", sub: "Configuración", empty: "Sin plataformas.", newBtn: "Nueva", create: "Añadir", name: "Nombre", kind: "Tipo", configJson: "Configuración (JSON)", badJson: "JSON inválido", added: "Añadida", enabled: "Activa", disabled: "Inactiva", hintFb: "Ejemplo FB:" },
    jobs: { title: "Tareas", sub: "Seguimiento en vivo", empty: "Sin tareas.", viewPost: "Ver publicación →", viewResponse: "Ver respuesta", queued: "En cola", running: "En curso", success: "Éxito", failed: "Fallo", cancelled: "Cancelada" },
    activity: { title: "Registro", subAll: "Toda la actividad", subMine: "Tu actividad", empty: "Sin registros." },
    admin: { title: "Administración", sub: "Gestionar cuentas", activate: "Activar", ban: "Bloquear", confirmDelete: "¿Eliminar definitivamente?", roles: "Roles:", grantRole: "+ Conceder", statusActive: "Activa", statusBanned: "Bloqueada", statusPending: "Pendiente", updated: "Actualizado", deleted: "Eliminado", granted: "Rol concedido" },
  }},
  tr: { translation: {
    common: { loading: "Yükleniyor...", save: "Kaydet", cancel: "İptal", delete: "Sil", edit: "Düzenle", create: "Oluştur", confirm: "Onayla", back: "Geri", search: "Ara", language: "Dil", yes: "Evet", no: "Hayır", or: "veya", required: "Zorunlu", success: "Başarılı", error: "Hata oluştu", retry: "Tekrar dene", pageNotFound: "Sayfa bulunamadı", home: "Ana sayfa" },
    nav: { dashboard: "Panel", listings: "İlanlar", platforms: "Platformlar", jobs: "Yayın görevleri", activity: "Etkinlik", admin: "Yönetim", login: "Giriş", signup: "Kayıt", logout: "Çıkış", startFree: "Ücretsiz başla" },
    landing: { badge: "Yalnızca resmi API'ler", h1a: "Bir kez yayınla.", h1b: "Her yere ulaş.", sub: "Merkezi yayın konsolu.", ctaStart: "Başla", footer: "Yalnızca resmi API'ler.", f1t: "Çoklu platform yayını", f1d: "Facebook, Bayut, PF, Dubizzle.", f2t: "Anında platform ekle", f2d: "Herhangi bir API/Webhook.", f3t: "Canlı günlük", f3d: "Her görevi takip et.", f4t: "Zamanlama", f4d: "Resmi limitlere uyum.", f5t: "Birleşik editör", f5d: "Tek form, her platform.", f6t: "Roller & izinler", f6d: "Super Admin / Admin / vb." },
    auth: { loginTitle: "Giriş", signupTitle: "Hesap oluştur", email: "E-posta", password: "Şifre", fullName: "Ad soyad", submitLogin: "Giriş yap", submitSignup: "Oluştur", loggingIn: "Giriş yapılıyor...", noAccount: "Hesap yok mu?", hasAccount: "Zaten üye misin?", passwordTooShort: "Şifre en az 8 karakter", loggedIn: "Giriş yapıldı", signedUpPending: "Hesap oluşturuldu — onay bekleniyor" },
    dashboard: { welcome: "Hoş geldin, {{name}}", overview: "Etkinlik genel bakışı", listings: "İlanlar", platforms: "Platformlar", jobs: "Görevler", success: "Başarılı", failed: "Başarısız", pendingNote: "Hesabınız inceleniyor.", pending: "Beklemede", banned: "Yasaklı" },
    listings: { title: "İlanlar", sub: "Yayına hazır ilanlar", empty: "İlan yok.", newBtn: "Yeni ilan", create: "İlan oluştur", publish: "Yayınla", chooseTargets: "Platform seç", noPlatforms: "Aktif platform yok.", addPlatform: "Platform ekle", pickOne: "En az bir seç", runNow: "Şimdi çalıştır", deleted: "Silindi", created: "Oluşturuldu", jobsCreated: "{{n}} görev oluşturuldu", kind: "Tür", titleField: "Başlık", desc: "Açıklama", price: "Fiyat", currency: "Para", category: "Kategori", location: "Konum", kindAd: "İlan", kindVideo: "Video", kindReel: "Reel", kindStory: "Hikaye" },
    platforms: { title: "Platformlar", sub: "Ayarlar", empty: "Platform yok.", newBtn: "Yeni", create: "Ekle", name: "Ad", kind: "Tür", configJson: "Ayarlar (JSON)", badJson: "Geçersiz JSON", added: "Eklendi", enabled: "Açık", disabled: "Kapalı", hintFb: "FB örneği:" },
    jobs: { title: "Görevler", sub: "Canlı takip", empty: "Görev yok.", viewPost: "Gönderiyi gör →", viewResponse: "Yanıtı gör", queued: "Sırada", running: "Çalışıyor", success: "Başarılı", failed: "Başarısız", cancelled: "İptal" },
    activity: { title: "Etkinlik", subAll: "Tüm etkinlik", subMine: "Etkinliğin", empty: "Kayıt yok." },
    admin: { title: "Yönetim", sub: "Hesap yönetimi", activate: "Aktifleştir", ban: "Yasakla", confirmDelete: "Kalıcı olarak sil?", roles: "Roller:", grantRole: "+ Rol ver", statusActive: "Aktif", statusBanned: "Yasaklı", statusPending: "Beklemede", updated: "Güncellendi", deleted: "Silindi", granted: "Rol verildi" },
  }},
  ur: { translation: {
    common: { loading: "لوڈ ہو رہا ہے...", save: "محفوظ", cancel: "منسوخ", delete: "حذف", edit: "ترمیم", create: "بنائیں", confirm: "تصدیق", back: "واپس", search: "تلاش", language: "زبان", yes: "ہاں", no: "نہیں", or: "یا", required: "ضروری", success: "کامیاب", error: "خرابی", retry: "دوبارہ", pageNotFound: "صفحہ نہیں ملا", home: "ہوم" },
    nav: { dashboard: "ڈیش بورڈ", listings: "اشتہارات", platforms: "پلیٹ فارمز", jobs: "اشاعت کے کام", activity: "سرگرمی", admin: "ایڈمن", login: "لاگ ان", signup: "سائن اپ", logout: "لاگ آؤٹ", startFree: "مفت شروع" },
    landing: { badge: "صرف سرکاری APIs", h1a: "ایک بار شائع کریں۔", h1b: "ہر جگہ پہنچیں۔", sub: "مرکزی اشاعت کنسول۔", ctaStart: "شروع کریں", footer: "صرف سرکاری APIs۔", f1t: "ملٹی پلیٹ فارم", f1d: "Facebook, Bayut, PF, Dubizzle.", f2t: "فوری پلیٹ فارم", f2d: "کوئی بھی API/Webhook۔", f3t: "لائیو لاگ", f3d: "ہر کام دیکھیں۔", f4t: "شیڈولنگ", f4d: "سرکاری حدود۔", f5t: "متحد ایڈیٹر", f5d: "ایک فارم۔", f6t: "کردار", f6d: "Super Admin وغیرہ۔" },
    auth: { loginTitle: "لاگ ان", signupTitle: "اکاؤنٹ بنائیں", email: "ای میل", password: "پاس ورڈ", fullName: "پورا نام", submitLogin: "داخل ہوں", submitSignup: "بنائیں", loggingIn: "...", noAccount: "اکاؤنٹ نہیں؟", hasAccount: "پہلے سے اکاؤنٹ؟", passwordTooShort: "کم از کم 8 حروف", loggedIn: "لاگ ان ہو گیا", signedUpPending: "منظوری کا انتظار" },
    dashboard: { welcome: "خوش آمدید، {{name}}", overview: "آپ کی سرگرمی", listings: "اشتہارات", platforms: "پلیٹ فارمز", jobs: "کام", success: "کامیاب", failed: "ناکام", pendingNote: "اکاؤنٹ زیر جائزہ۔", pending: "زیر التواء", banned: "پابندی" },
    listings: { title: "اشتہارات", sub: "تیار اشتہارات", empty: "کوئی اشتہار نہیں۔", newBtn: "نیا", create: "بنائیں", publish: "شائع", chooseTargets: "پلیٹ فارم منتخب", noPlatforms: "کوئی پلیٹ فارم نہیں۔", addPlatform: "شامل کریں", pickOne: "کم از کم ایک", runNow: "ابھی چلائیں", deleted: "حذف", created: "بن گیا", jobsCreated: "{{n}} کام بنے", kind: "قسم", titleField: "عنوان", desc: "تفصیل", price: "قیمت", currency: "کرنسی", category: "زمرہ", location: "مقام", kindAd: "اشتہار", kindVideo: "ویڈیو", kindReel: "ریل", kindStory: "اسٹوری" },
    platforms: { title: "پلیٹ فارمز", sub: "ترتیبات", empty: "کوئی نہیں۔", newBtn: "نیا", create: "شامل", name: "نام", kind: "قسم", configJson: "ترتیبات (JSON)", badJson: "غلط JSON", added: "شامل ہو گیا", enabled: "فعال", disabled: "غیر فعال", hintFb: "FB مثال:" },
    jobs: { title: "کام", sub: "لائیو", empty: "کوئی نہیں۔", viewPost: "پوسٹ دیکھیں →", viewResponse: "جواب", queued: "قطار", running: "جاری", success: "کامیاب", failed: "ناکام", cancelled: "منسوخ" },
    activity: { title: "سرگرمی", subAll: "تمام", subMine: "آپ کی", empty: "کوئی ریکارڈ نہیں۔" },
    admin: { title: "ایڈمن", sub: "اکاؤنٹس", activate: "فعال", ban: "پابندی", confirmDelete: "مستقل حذف؟", roles: "کردار:", grantRole: "+ دیں", statusActive: "فعال", statusBanned: "پابندی", statusPending: "زیر التواء", updated: "اپ ڈیٹ", deleted: "حذف", granted: "دیا گیا" },
  }},
  hi: { translation: {
    common: { loading: "लोड हो रहा है...", save: "सहेजें", cancel: "रद्द", delete: "हटाएं", edit: "संपादित", create: "बनाएं", confirm: "पुष्टि", back: "वापस", search: "खोज", language: "भाषा", yes: "हां", no: "नहीं", or: "या", required: "आवश्यक", success: "सफल", error: "त्रुटि हुई", retry: "पुनः प्रयास", pageNotFound: "पृष्ठ नहीं मिला", home: "होम" },
    nav: { dashboard: "डैशबोर्ड", listings: "विज्ञापन", platforms: "प्लेटफ़ॉर्म", jobs: "कार्य", activity: "गतिविधि", admin: "एडमिन", login: "साइन इन", signup: "साइन अप", logout: "साइन आउट", startFree: "मुफ़्त शुरू" },
    landing: { badge: "केवल आधिकारिक APIs", h1a: "एक बार प्रकाशित करें।", h1b: "हर जगह पहुंचें।", sub: "केंद्रीय प्रकाशन कंसोल।", ctaStart: "शुरू करें", footer: "केवल आधिकारिक APIs।", f1t: "मल्टी-प्लेटफ़ॉर्म", f1d: "Facebook, Bayut, PF, Dubizzle.", f2t: "तुरंत जोड़ें", f2d: "कोई भी API/Webhook।", f3t: "लाइव लॉग", f3d: "हर कार्य देखें।", f4t: "शेड्यूलिंग", f4d: "आधिकारिक सीमाएं।", f5t: "एकीकृत संपादक", f5d: "एक फ़ॉर्म।", f6t: "भूमिकाएं", f6d: "Super Admin आदि।" },
    auth: { loginTitle: "साइन इन", signupTitle: "खाता बनाएं", email: "ईमेल", password: "पासवर्ड", fullName: "पूरा नाम", submitLogin: "साइन इन", submitSignup: "बनाएं", loggingIn: "...", noAccount: "खाता नहीं?", hasAccount: "पहले से खाता?", passwordTooShort: "कम से कम 8 अक्षर", loggedIn: "साइन इन हुआ", signedUpPending: "अनुमोदन प्रतीक्षित" },
    dashboard: { welcome: "स्वागत है, {{name}}", overview: "आपकी गतिविधि", listings: "विज्ञापन", platforms: "प्लेटफ़ॉर्म", jobs: "कार्य", success: "सफल", failed: "असफल", pendingNote: "खाता समीक्षाधीन।", pending: "लंबित", banned: "प्रतिबंधित" },
    listings: { title: "विज्ञापन", sub: "तैयार विज्ञापन", empty: "कोई विज्ञापन नहीं।", newBtn: "नया", create: "बनाएं", publish: "प्रकाशित", chooseTargets: "प्लेटफ़ॉर्म चुनें", noPlatforms: "कोई सक्रिय नहीं।", addPlatform: "जोड़ें", pickOne: "कम से कम एक", runNow: "अभी चलाएं", deleted: "हटाया", created: "बना", jobsCreated: "{{n}} कार्य बने", kind: "प्रकार", titleField: "शीर्षक", desc: "विवरण", price: "मूल्य", currency: "मुद्रा", category: "श्रेणी", location: "स्थान", kindAd: "विज्ञापन", kindVideo: "वीडियो", kindReel: "रील", kindStory: "स्टोरी" },
    platforms: { title: "प्लेटफ़ॉर्म", sub: "सेटिंग्स", empty: "कोई नहीं।", newBtn: "नया", create: "जोड़ें", name: "नाम", kind: "प्रकार", configJson: "सेटिंग्स (JSON)", badJson: "अमान्य JSON", added: "जोड़ा गया", enabled: "सक्षम", disabled: "अक्षम", hintFb: "FB उदाहरण:" },
    jobs: { title: "कार्य", sub: "लाइव ट्रैकिंग", empty: "कोई नहीं।", viewPost: "पोस्ट देखें →", viewResponse: "प्रतिक्रिया", queued: "कतार में", running: "चल रहा", success: "सफल", failed: "असफल", cancelled: "रद्द" },
    activity: { title: "गतिविधि लॉग", subAll: "सभी", subMine: "आपकी", empty: "कोई रिकॉर्ड नहीं।" },
    admin: { title: "एडमिन पैनल", sub: "खाता प्रबंधन", activate: "सक्रिय", ban: "प्रतिबंध", confirmDelete: "स्थायी रूप से हटाएं?", roles: "भूमिकाएं:", grantRole: "+ दें", statusActive: "सक्रिय", statusBanned: "प्रतिबंधित", statusPending: "लंबित", updated: "अद्यतन", deleted: "हटाया", granted: "भूमिका दी" },
  }},
};

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "ar",
      supportedLngs: SUPPORTED_LANGS.map((l) => l.code),
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
      },
    });
}

export function applyLangToDocument(lang: string) {
  if (typeof document === "undefined") return;
  const meta = SUPPORTED_LANGS.find((l) => l.code === lang) ?? SUPPORTED_LANGS[0];
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.dir;
}

export default i18n;
