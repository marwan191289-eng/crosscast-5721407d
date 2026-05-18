# خطة البناء — منصة النشر المركزي

سأبني المنصة على مراحل، نبدأ بالأساس ثم نضيف التكاملات.

## المرحلة 1 — الأساس (هذه الجلسة)
1. **تفعيل Lovable Cloud** (قاعدة بيانات + auth + storage + server functions)
2. **نظام المصادقة**: Email/Password + Google + Apple (المدعومة أصلاً في Cloud)
   - Facebook/Twitter/Discord/Microsoft غير مدعومة في Cloud مباشرة — تحتاج Supabase Integration منفصل أو OAuth يدوي. سأضيف Email + Google + Apple الآن، والباقي كمرحلة لاحقة عبر OAuth custom.
   - Phone OTP عبر Cloud
3. **نظام الأدوار (RBAC)**: جدول `user_roles` منفصل + enum (`admin`, `manager`, `agent`, `viewer`) + دالة `has_role` security definer
4. **لوحة المطوّر (Super Admin)**:
   - عرض كل الحسابات، حظر/حذف/الموافقة على التسجيل
   - منح/سحب الصلاحيات
   - عرض سجلات النشاط
5. **SEO + Meta كاملة**:
   - توليد لوجو + favicon + OG image (1200x630) + Twitter card
   - عنوان فيروسي + وصف + hooks
   - JSON-LD، canonical، sitemap
6. **صفحة هبوط** بهوية بصرية مميزة

## المرحلة 2 — محرر الإعلان الموحّد
- نموذج إعلان واحد (عنوان، وصف، صور، سعر، فئة، موقع، تواصل)
- معاينة حية لكل منصة (FB / Bayut / PF / Dubizzle / موقع مخصص)
- تكييف تلقائي للمحتوى (حد أحرف، عدد صور، حقول مطلوبة)
- حفظ كـ draft / template

## المرحلة 3 — التكاملات الرسمية
- **Facebook Graph API**: نشر على Pages + Marketplace Catalog (يتطلب Business verification + App review من Meta)
- **Bayut/Property Finder**: توليد XML Feed يستضيفه التطبيق على `/api/public/feeds/{agent_id}/bayut.xml` و `…/pf.xml` — يضعها الوكيل في حسابه الرسمي
- **Dubizzle**: تصدير CSV/XML للـ bulk upload الرسمي
- **منصة عامة (REST)**: واجهة لإضافة أي API/Webhook مخصص (URL + headers + body template + auth)
- **موقع إلكتروني مخصص**: WordPress REST API / generic webhook

## المرحلة 4 — التشغيل والمتابعة
- **جدولة**: cron + queue، نشر في أوقات الذروة لكل منصة
- **Refresh ذكي**: استخدام refresh credits الرسمية لـ Bayut/PF حسب الكوتا
- **سجل عمليات حي**: كل محاولة نشر تُسجَّل (نجاح/فشل + سبب + الرد الكامل من المنصة)
- **بث مباشر للتقدّم**: عبر Supabase Realtime — المستخدم يرى المهمة تنتقل بين المنصات لحظياً مع شريط تقدّم وlogs
- **Analytics**: مشاهدات/استفسارات/تحويلات لكل منصة (من APIs المنصات إن أتاحت ذلك)

## ملاحظات تقنية
- لن أبني أي وظيفة لـ: محاكاة المتصفح، نشر في جروبات FB آلياً، تجاوز rate limits، إخفاء بصمة، rotation للحسابات/IPs
- كل تكامل يحتاج credentials رسمية يطلبها التطبيق من المستخدم ويخزّنها مشفّرة
- صلاحيات صارمة عبر RLS على كل جدول

## ما أحتاج تأكيده منك قبل البدء
1. هل تريد دمج **Facebook/Twitter/Discord/Microsoft login** عبر Supabase Integration الكامل (سيظهر لك في الـ dashboard لتفعيل كل provider بمفاتيحه)، أم نكتفي بـ Email + Google + Apple + Phone في المرحلة 1؟
2. هوية بصرية: عندك اسم للمنصة ولون مفضّل، أم أختار اسماً وهوية احترافية؟

سأبدأ بالمرحلة 1 فور موافقتك.
