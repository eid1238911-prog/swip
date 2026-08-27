# JocMart - متجر الحلول والمنتجات الذكية 🛒✨

متجر إلكتروني عصري ومتكامل متخصص في تقديم **المنتجات الإبداعية والحلول الذكية** اليومية، مبني بأحدث تقنيات الويب (Next.js 15, React 19, Firebase, Tailwind CSS, PayPal).

---

## 🌟 الميزات الرئيسية (Features)

* **🏪 واجهة تسوق ذكية:**
  * بحث فوري وتصنيف للمنتجات حسب الفئات.
  * هيكل متجاوب بالكامل يدعم اللغة العربية واتجاه اليمين لليسار (`dir="rtl"`).
  * تأثيرات تحميل سريعة (Skeleton Loaders) وتصميم تفاعلي جذاب.
* **🔐 نظام حسابات متكامل:**
  * تسجيل الدخول وإنشاء حسابات جديدة للمستخدمين.
  * صفحة الملف الشخصي (`/profile`) لتعديل البيانات وسجل متابعة الطلبات السابقة.
* **💳 تدفق شراء آمن ومباشر:**
  * سلة مشتريات تفاعلية (`/cart`) مع حساب دقيق لرسوم الشحن وبوابات الدفع.
  * تكامل مع **PayPal Smart Payment Buttons**.
* **⚙️ لوحة تحكم إدارية للمسؤولين (`/admin`):**
  * إضافة وتعديل وحذف المنتجات بالصور والأسعار.
  * إدارة الفئات والتصنيفات.
  * متابعة الطلبات وتغيير حالاتها (جديد، قيد التنفيذ، تم الشحن، تم الاستلام).
  * صفحة تفاصيل الطلب مع ميزة طباعة الفاتورة (`Print Invoice`).
* **💬 دعم فني فوري:**
  * زر عائم للواتساب للتواصل المباشر مع خدمة العملاء.

---

## 🚀 التقنيات المستخدمة (Tech Stack)

* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
* **Library:** React 19, TypeScript
* **Styling & UI:** Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/) (Radix UI), Lucide Icons
* **Database & Auth:** Google Firebase (Firestore & Authentication)
* **Payments:** PayPal React SDK (`@paypal/react-paypal-js`)
* **AI Engine:** Google Genkit

---

## 🛠️ كيفية التثبيت والتشغيل محلياً (Local Setup)

1. **استنساخ المستودع (Clone Repository):**
```bash
git clone https://github.com/YOUR_USERNAME/jocmart.git
cd jocmart
```

2. **تثبيت المكاتب والحزم (Install Dependencies):**
```bash
npm install
```

3. **إعداد متغيرات البيئة (Environment Variables):**
قم بإنشاء ملف باسم `.env.local` في المجلد الرئيسي وضع به مفتاح PayPal الخاص بك:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

4. **تشغيل خادم التطوير (Run Development Server):**
```bash
npm run dev
```
افتح المتصفح وتوجه إلى: `http://localhost:9002`

---

## 📄 هيكل الصفحات (Pages Structure)

* `/` - الصفحة الرئيسية وعرض أحدث الحلول الذكية.
* `/products` - دليل ومعرض كافة المنتجات مع البحث والفلترة.
* `/product/[id]` - تفاصيل المنتج ومعرض الصور.
* `/cart` - سلة المشتريات والدفع.
* `/auth` - تسجيل الدخول وإنشاء حساب جديد.
* `/profile` - الملف الشخصي وسجل الطلبات.
* `/about` - عن المتجر ونموذج العمل.
* `/shipping` - سياسة الشحن والتوصيل.
* `/faq` - الأسئلة الشائعة.
* `/admin` - لوحة تحكم الإدارة ومتابعة المبيعات.

---

## 📜 الترخيص (License)

هذا المشروع مخصص لمتجر **JocMart**. جميع الحقوق محفوظة ©.
