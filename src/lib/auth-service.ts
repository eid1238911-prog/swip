/**
 * خدمة التحقق من توفر اسم المستخدم عبر الـ API الخاص بالتطبيق الأصلي.
 */

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  // رابط التطبيق الأصلي (App A) الذي يعمل كـ Server
  const APP_A_URL = "https://studio--gig-40853214-e782d.europe-west4.hosted.app";
  
  try {
    const response = await fetch(`${APP_A_URL}/api/auth/username-available?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // المفتاح السري المطلوب في رأس الطلب
        'x-app-service-key': 'mygigs_internal_secure_key_2024'
      }
    });

    if (!response.ok) {
      // في حال فشل الاتصال، نعتبر الاسم غير متاح للحماية
      return false;
    }

    const data = await response.json();
    // نفترض أن الـ API يعيد كائن يحتوي على خاصية available
    return !!data.available;

  } catch (error) {
    // في حالة حدوث خطأ في الشبكة
    return false;
  }
};
